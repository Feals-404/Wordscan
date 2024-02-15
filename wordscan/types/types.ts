export interface ConfigData {
    config: {
        user_agent: string;
        threads: number;
        ignore_code: string[];
        ignore_size: string[];
        apiTokens: string[];
    }
}

export interface WPScanAPIResponse {
    wpscan_credit_remaining: number;
}

export interface ScanListResult {
    id: string;
    scan_date: string;
    status: string;
    url: string;
  }

export interface IReferences {
    url: string[];
    cve: string[];
}

export interface PluginVersions {
    [key: string]: string;
}

export interface ThemeVersions {
    [key: string]: string;
}

export interface PluginVulnerability {
    title: string;
    description: string;
    poc: string;
    vuln_type: string;
    references: IReferences;
    verified: boolean;
    fixed_in: string;
    introduced_in: string;
}

export interface Plugin {
    friendly_name: string;
    latest_version: string;
    current_version: string;
    last_updated: Date;
    popular: boolean;
    vulnerabilities: PluginVulnerability[];
}

export interface ThemeVulnerability {
    title: string;
    description: string;
    poc: string;
    vuln_type: string;
    references: {
        url: string;
    };
    cvss: string;
    verified: boolean;
    fixed_in: string;
    introduced_in: string;
}

export interface Theme {
    friendly_name: string;
    latest_version: string;
    current_version: string;
    last_updated: Date;
    popular: boolean;
    vulnerabilities: ThemeVulnerability[];
}

export interface WordPressVulnerability {
    title: string;
    description: string;
    poc: string;
    vuln_type: string;
    references: IReferences;
    cvss: string;
    fixed_in: string;
    introduced_in: string;
}

export interface ScanResult {
    scan_id: string;
    scan_date: Date;
    status: string;
    url: string;
    wordpress_version: string;
    isdirectorylisting: boolean;
    isxmlrpc: boolean;
    iswpcron: boolean;
    iswplogin: boolean;
    isregisterenable: boolean;
    isdebuglog: boolean;
    isoembedssrf: boolean;
    users: string[];
    plugins: Map<string, Plugin>;
    themes: Map<string, Theme>;
    wordpress_vulnerabilities: WordPressVulnerability[];
}
