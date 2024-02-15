import axios, { AxiosInstance } from 'axios';
import cheerio from 'cheerio';
import { Agent } from 'https';
import PQueue from 'p-queue';
import * as xml2js from 'xml2js';
import semver from 'semver';
import { ConfigDocument } from '@/models/Config'
import { WordlistDocument } from '@/models/Wordlist'
import ScanResult from '@/models/ScanResult'
import { PluginVersions, Plugin, Theme, PluginVulnerability, ThemeVersions, ThemeVulnerability} from '@/types/types';
import WPScanAPI from '@/utils/WPScanApi';


class WordPressScanner {
  private config: ConfigDocument;
  private wordlist: WordlistDocument;
  private wpScanAPI: WPScanAPI;
  private ScanResultModel: typeof ScanResult;
  private axiosInstance: AxiosInstance;

  constructor(config: ConfigDocument, wordlist: WordlistDocument) {
    this.config = config;
    this.wordlist = wordlist;
    this.wpScanAPI = new WPScanAPI(config.config.apiTokens);
    this.ScanResultModel = ScanResult;
    this.axiosInstance = axios.create({
      httpsAgent: new Agent({
        rejectUnauthorized: false
      }),
      headers: {
        'User-Agent': config.user_agent
      }
    });
  }

  public async isWordPress(url: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(url);
      const html = response.data;

      const $ = cheerio.load(html);
      const wpIndicators = ['wp-content', 'wp-admin', 'wp-includes', 'wp-login.php', 'content="WordPress'];
      const metaIndicators = [$('meta[name="generator"][content^="WordPress"]').length, $('meta[name="generator"][content^="WordPress.com"]').length];

      const stringMatch = wpIndicators.some(indicator => html.includes(indicator));
      const metaMatch = metaIndicators.some(indicator => indicator > 0);

      const serverHeader = response.headers['server'];
      const serverMatch = serverHeader && serverHeader.toLowerCase().includes('wordpress');

      return stringMatch || metaMatch || serverMatch;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error While trying to guess Wordpress', error);
      }
      return false;
    }
  }

  private async getWordpressVersion(url: string): Promise<string | null> {
    try {
      const response = await this.axiosInstance.get(url);
      const htmlContent = response.data;

      const $ = cheerio.load(htmlContent);

      const versionMetaTag = $('meta[name="generator"][content^="WordPress "]');

      if (versionMetaTag.length > 0) {
        const versionContent = versionMetaTag.attr('content');
        if (versionContent) {
          const versionMatch = versionContent.match(/^WordPress (\d+(\.\d+)+)/);
          if (versionMatch && versionMatch[1]) {
            return versionMatch[1];
          }
        }
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error on getWordpressVersion:', error);
      }
      return null;
    }
  }

  private async getWordpressVuln(version: string): Promise<any> {  
    const versionFormatted = version.replace(/\./g, '');
    try {
      const WPVulnerabilities = await this.wpScanAPI.getWordPressVulnerabilitiesByVersion(versionFormatted);

      const vulnerabilities = WPVulnerabilities[version].vulnerabilities;

      const formattedVulnerabilities = vulnerabilities.map((vuln: PluginVulnerability) => {
        return {
          title: vuln.title,
          description: vuln.description,
          poc: vuln.poc,
          vuln_type: vuln.vuln_type,
          references: {
            url: vuln.references.url,
            cve: vuln.references.cve
          },
          verified: false,
          fixed_in: vuln.fixed_in,
          introduced_in: version
        };
      });

      return formattedVulnerabilities;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching WordPress vulnerabilities:', error);
        throw error;
      }
    }

  }

  private async isXMLRPC(url: string): Promise<boolean> {
    const postData = '<methodCall><methodName>system.listMethods</methodName><params></params></methodCall>';
    const methodsToCheck = ['pingback.extensions.getPingbacks', 'pingback.ping'];

    try {
      const response = await this.axiosInstance.post(url + '/xmlrpc.php', postData, {
        headers: {
          'Content-Type': 'text/xml',
        },
      });

      if (response.status === 200) {
        const xmlResponse = await xml2js.parseStringPromise(response.data);
        if (xmlResponse.methodResponse && xmlResponse.methodResponse.params && xmlResponse.methodResponse.params[0] && xmlResponse.methodResponse.params[0].param && xmlResponse.methodResponse.params[0].param[0] && xmlResponse.methodResponse.params[0].param[0].value && xmlResponse.methodResponse.params[0].param[0].value[0] && xmlResponse.methodResponse.params[0].param[0].value[0].array && xmlResponse.methodResponse.params[0].param[0].value[0].array[0] && xmlResponse.methodResponse.params[0].param[0].value[0].array[0].data && xmlResponse.methodResponse.params[0].param[0].value[0].array[0].data[0] && xmlResponse.methodResponse.params[0].param[0].value[0].array[0].data[0].value) {
          const methodNames = xmlResponse.methodResponse.params[0].param[0].value[0].array[0].data[0].value.map((method: { string: any[]; }) => method.string[0]);

          for (const methodName of methodNames) {
            if (methodsToCheck.includes(methodName)) {
              const postData = `<methodCall><methodName>${methodName}</methodName><params></params></methodCall>`;
              const response = await this.axiosInstance.post(url + '/xmlrpc.php', postData, {
                headers: {
                  'Content-Type': 'text/xml',
                },
              });

              const xmlResponse = await xml2js.parseStringPromise(response.data);
              if (xmlResponse.methodResponse && xmlResponse.methodResponse.fault && xmlResponse.methodResponse.fault[0] && xmlResponse.methodResponse.fault[0].value && xmlResponse.methodResponse.fault[0].value[0] && xmlResponse.methodResponse.fault[0].value[0].struct && xmlResponse.methodResponse.fault[0].value[0].struct[0] && xmlResponse.methodResponse.fault[0].value[0].struct[0].member && xmlResponse.methodResponse.fault[0].value[0].struct[0].member[0] && xmlResponse.methodResponse.fault[0].value[0].struct[0].member[0].value && xmlResponse.methodResponse.fault[0].value[0].struct[0].member[0].value[0] && xmlResponse.methodResponse.fault[0].value[0].struct[0].member[0].value[0].int) {
                const faultCode = xmlResponse.methodResponse.fault[0].value[0].struct[0].member[0].value[0].int[0];

                if (faultCode === '0') {
                  return true;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  private async isWpCron(url: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(url + '/wp-cron.php');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async isWpLogin(url: string): Promise<boolean> {
    try {
      const path = ["/wp-admin/login.php", "/wp-admin/wp-login.php", "/login.php", "/wp-login.php"];

      for (const p of path) {
        try {
          const response = await this.axiosInstance.get(url + p);
          if (response.status === 200) {
            return true;
          }
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            continue;
          } else {
            throw error;
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async isRegisterEnable(url: string): Promise<boolean> {
    const paths = [
      "/wp-admin/login.php?action=register",
      "/wp-admin/wp-login.php?action=register",
      "/login.php?action=register",
      "/wp-login.php?action=register"
    ];

    for (const path of paths) {
      try {
        const response = await this.axiosInstance.get(`${url}${path}`);

        if (
          response.status === 200 &&
          response.data.includes("Register For This Site") &&
          response.data.includes("E-mail")
        ) {
          return true;
        }
      } catch (error) {
        if (error instanceof Error) {
          //console.error('Error checking WordPress registration:', error.message);
        }
      }
    }

    return false;
  }

  private async isWPConfig(url: string): Promise<boolean> {
    const paths = ['/wp-config.php', '/wp-config.inc', '/wp-config.old', '/wp-config.txt', '/wp-config.php~', '/config.php.zip', '/config.php.new', '/wp-config.php.bk', '/wp-config.backup',
      '/config.php.tar.gz', '/wp-config.php.txt', '/wp-config.php.bak', '/wp-config.php.BAK', '/wp-config.php.old', '/wp-config.php.OLD', '/wp-config.php.dist', '/wp-config.php.inc', 
      '/wp-config.php.swp', '/wp-config.php.html', '/.wp-config.php.swp', '/wp-config.php.save', '/wp-config.php.SAVE', '/wp-config.php.orig', '/wp-config.php_orig',
      '/wp-config-sample.php', '/wp-config-backup.txt', '/wp-config.php-backup', '/common/config.php.new', '/wp-config.php.original', '/_wpeprivate/config.json'];
  
    const requiredFields = ["DB_NAME", "DB_PASSWORD", "DBNAME", "PASSWORD", "DB_USERNAME", "DB_PASSWORD"];
  
    for (const path of paths) {
      try {
        const response = await this.axiosInstance.get(`${url}${path}`);
  
        if (
          response.status === 200 &&
          requiredFields.some(field => response.data.includes(field))
        ) {
          return true;
        }
      } catch (error) {
        if (error instanceof Error) {
          // console.error('Error checking WordPress WPCONFIG:', error.message);
        }
      }
    }
  
    return false;
  }

  private async isDebugLog(url: string): Promise<boolean> {
    const paths = ['wp-content', 'wordpress', 'wp', 'blog'];

    for (const p of paths) {
      try {
        const response = await this.axiosInstance.get(`${url}/${p}/debug.log`);
        const contentType = response.headers['content-type'];

        if (
          (contentType.includes('octet-stream') || contentType.includes('text/plain')) &&
          response.data.match(/[0-9]{2}-[a-zA-Z]{3}-[0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2} [A-Z]{3}] PHP/)
        ) {
          return true;
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          continue;
        } else {
          console.error('Error fetching debug log:', error.message);
          return false;
        }
      }
    }
    return false;
  }

  private async isOembedSSRF(url: string): Promise<boolean> { //NOT DONE
    return true
  }

  private async isDirectoryListing(url: string): Promise<boolean> {
    const urlc = `${url}/wp-content/uploads/`;
    try {
      const response = await this.axiosInstance.get(urlc);

      if (response.status === 200) {
        const contentType = response.headers['content-type'];

        const responseBody = response.data;
        const directoryListingDetected = /Index\s*Of/i.test(responseBody);

        return directoryListingDetected;
      } else {
        console.error('Le serveur a renvoyé un code d\'état non valide :', response.status);
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private async isWPJson(url: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(`${url}/wp-json/wp/v2/users`);
      return response.status === 200 && response.headers['content-type'].includes('application/json');
    } catch (error) {
      return false;
    }
  }

  private async getUsers(url: string): Promise<string[]> {
    try {
      if (await this.isWPJson(url)) {
        const response = await this.axiosInstance.get(`${url}/wp-json/wp/v2/users`);
        const users = response.data;
        if (Array.isArray(users)) {
          return users.map(user => user.name);
        } else {
          return [users.name];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error on getUsers:', error);
      return [];
    }
  }

  private async getPluginsVersions(url: string): Promise<PluginVersions> {
    try {
      const threads = this.config.config.threads;
      const plugins = this.wordlist.wordlists.plugins || [];
      const pluginVersions: PluginVersions = {};
      const queue = new PQueue({ concurrency: threads });

      for (const plugin of plugins) {
        queue.add(async () => {
          const pluginUrl = `${url}/wp-content/plugins/${plugin}/readme.txt`;
          try {
            const response = await this.axiosInstance.get(pluginUrl, {
              validateStatus: (status) => status >= 200 && status < 300,
            })

            if (response.status === 200) {
              const versionMatch = response.data.match(/Stable\s*tag:\s*([\w.-]+)/i);
              if (versionMatch) {
                pluginVersions[plugin] = versionMatch[1];
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Error fetching version for plugin ${plugin}:`, error.message);
            }
          }
        });
      }

      await queue.onIdle();

      return pluginVersions;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in getPluginsVersions:', error.message);
      }
      return {};
    }
  }

  private normalizeVersion(version: string): string {
    if (version == "trunk") {
      return "9999.9999.9999"
    }
    const sanitizedVersion = version.replace(/[^\d.-]/g, '');
    const segments = sanitizedVersion.split(/[.-]/);
    const normalizedSegments = segments.map(seg => {
      let parsedSeg = parseInt(seg, 10);
      return isNaN(parsedSeg) ? 0 : parsedSeg;
    });
    const truncatedSegments = normalizedSegments.slice(0, 3);
    while (truncatedSegments.length < 3) {
      truncatedSegments.push(0);
    }
    return truncatedSegments.join('.');
  }

  private async getPluginsVuln(url: string): Promise<any> { 
    const pluginsVersions = await this.getPluginsVersions(url);
    const pluginsVulnerabilities: { [key: string]: Plugin } = {};

    for (const [pluginSlug, pluginVersion] of Object.entries(pluginsVersions)) {
      const pluginVulnerabilities = await this.wpScanAPI.getPluginVulnerabilitiesBySlug(pluginSlug);
      Object.keys(pluginVulnerabilities).forEach(vulnPluginSlug => {
        const pluginData = pluginVulnerabilities[vulnPluginSlug];
        const normalizedPluginVersion = this.normalizeVersion(pluginVersion);

        const pluginVulns = pluginData.vulnerabilities.filter((vuln: PluginVulnerability) => {
          return vuln.fixed_in && semver.gt(this.normalizeVersion(vuln.fixed_in), normalizedPluginVersion);
        });
        const pluginObj: Plugin = {
          friendly_name: pluginData.friendly_name,
          latest_version: pluginData.latest_version,
          current_version: pluginVersion,
          last_updated: pluginData.last_updated,
          popular: pluginData.popular,
          vulnerabilities: pluginVulns.map((vuln: PluginVulnerability) => ({
            title: vuln.title,
            description: vuln.description,
            poc: vuln.poc,
            vuln_type: vuln.vuln_type,
            references: vuln.references,
            verified: vuln.verified,
            fixed_in: vuln.fixed_in,
            introduced_in: vuln.introduced_in
          }))
        };
        pluginsVulnerabilities[pluginSlug] = pluginObj;
      });
    }

    return pluginsVulnerabilities;
  }

  private async getThemesVersions(url: string): Promise<ThemeVersions> {
    try {
      const threads = this.config.config.threads;
      const themes = this.wordlist.wordlists.themes || [];
      const themeVersions: ThemeVersions = {};
      const queue = new PQueue({ concurrency: threads });

      for (const theme of themes) {
        queue.add(async () => {
          const themeUrl = `${url}/wp-content/themes/${theme}/readme.txt`;
          try {
            const response = await this.axiosInstance.get(themeUrl, {
              validateStatus: (status) => status >= 200 && status < 300,
            })

            if (response.status === 200) {
              const versionMatch = response.data.match(/Stable\s*tag:\s*([\w.-]+)/i);
              if (versionMatch) {
                themeVersions[theme] = versionMatch[1];
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Error fetching version for themes ${theme}:`, error.message);
            }
          }
        });
      }

      await queue.onIdle();

      return themeVersions;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in getThemeVersions:', error.message);
      }
      return {};
    }
  }

  private async getThemeVuln(url: string): Promise<any> {
    const themesVersions = await this.getThemesVersions(url);
    const themesVulnerabilities: { [key: string]: Theme } = {};

    for (const [themeSlug, themesVersion] of Object.entries(themesVersions)) {
      const themeVulnerabilities = await this.wpScanAPI.getThemeVulnerabilitiesBySlug(themeSlug);
      Object.keys(themeVulnerabilities).forEach(vulnThemeSlug => {
        const themeData = themeVulnerabilities[vulnThemeSlug];
        const normalizedThemeVersion = this.normalizeVersion(themesVersion);

        const themeVulns = themeData.vulnerabilities.filter((vuln: ThemeVulnerability) => {
          return vuln.fixed_in && semver.gt(this.normalizeVersion(vuln.fixed_in), normalizedThemeVersion);
        });
        const themeObj: Theme = {
          friendly_name: themeData.friendly_name,
          latest_version: themeData.latest_version,
          current_version: themesVersion,
          last_updated: themeData.last_updated,
          popular: themeData.popular,
          vulnerabilities: themeVulns.map((vuln: ThemeVulnerability) => ({
            title: vuln.title,
            description: vuln.description,
            poc: vuln.poc,
            vuln_type: vuln.vuln_type,
            references: vuln.references,
            verified: vuln.verified,
            fixed_in: vuln.fixed_in,
            introduced_in: vuln.introduced_in
          }))
        };
        themesVulnerabilities[themeSlug] = themeObj;
      });
    }

    return themesVulnerabilities;
  }

  async handleScan(url: string, scanId: string): Promise<void> {
    try {
      const scanResultData = {
        scan_id: scanId,
        scan_date: new Date(),
        statut: 'In progress',
        url: url,
        plugins: new Map(),
        themes: new Map()
      };
      let statut = 'In progress';
      console.log('[WordPressScanner] ' + scanId + ' Starting Scan');
      const newScanResult = new ScanResult(scanResultData);
      await newScanResult.save();
      
      const wordpress_version = await this.getWordpressVersion(url);
      await this.updateScanResult(scanId, { wordpress_version });

      const isdirectorylisting = await this.isDirectoryListing(url);
      await this.updateScanResult(scanId, { isdirectorylisting });

      const isxmlrpc = await this.isXMLRPC(url);
      await this.updateScanResult(scanId, { isxmlrpc });

      const iswpcron = await this.isWpCron(url);
      await this.updateScanResult(scanId, { iswpcron });

      const iswplogin = await this.isWpLogin(url);
      await this.updateScanResult(scanId, { iswplogin });

      const iswpconfig = await this.isWPConfig(url);
      await this.updateScanResult(scanId, { iswpconfig });

      const isregisterenable = await this.isRegisterEnable(url);
      await this.updateScanResult(scanId, { isregisterenable });

      const isdebuglog = await this.isDebugLog(url);
      await this.updateScanResult(scanId, { isdebuglog });

      const isoembedssrf = await this.isOembedSSRF(url);
      await this.updateScanResult(scanId, { isoembedssrf });

      const users = await this.getUsers(url);
      await this.updateScanResult(scanId, { users });

      statut = "Enumerating plugins"
      await this.updateScanResult(scanId, { statut })
      
      const plugins = await this.getPluginsVuln(url);
      await this.updateScanResult(scanId, { plugins });

      statut = "Enumerating themes"
      await this.updateScanResult(scanId, { statut })

      const themes = await this.getThemeVuln(url);
      await this.updateScanResult(scanId, { themes });

      if (wordpress_version != null) {
        const wordpressvulns = await this.getWordpressVuln(wordpress_version);
        await this.updateScanResult(scanId, { wordpressvulns });
      }
      statut = "Finished"
      await this.updateScanResult(scanId, { statut })
      console.log('[WordPressScanner] ' + scanId + ' Finished');

    } catch (error) {
      console.error('Error creating scan result entry:', error);
    }
  }

  async updateScanResult(scanId: string, updateData: any): Promise<void> {
    try {
      const updatedScanResult = await ScanResult.findOneAndUpdate(
        { scan_id: scanId },
        { $set: updateData },
        { new: true }
      );

    } catch (error) {
      console.error('Error updating scan result:', error);
    }
  }
}

export default WordPressScanner;  