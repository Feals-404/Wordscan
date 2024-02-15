import mongoose, { Document, Schema, SchemaDefinition } from 'mongoose';
import { IReferences } from '@/types/types'

export interface IVulnerability extends Document {
    title: string;
    description: string;
    poc: string;
    vuln_type: string;
    references: IReferences;
    verified: boolean;
    fixed_in: string;
    introduced_in: string;
}

const vulnerabilitySchema: SchemaDefinition = {
    title: String,
    description: String,
    poc: String,
    vuln_type: String,
    references: {
        url: [String],
        cve: [String]
    },
    verified: Boolean,
    fixed_in: String,
    introduced_in: String
};

interface IPlugin extends Document {
    friendly_name: string;
    latest_version: string;
    current_version: string;
    last_updated: Date;
    popular: boolean;
    vulnerabilities: IVulnerability[];
}

const pluginSchema: SchemaDefinition = {
    friendly_name: String,
    latest_version: String,
    current_version: String,
    last_updated: Date,
    popular: Boolean,
    vulnerabilities: [new Schema(vulnerabilitySchema)]
};


interface ITheme extends Document {
    friendly_name: string;
    latest_version: string;
    current_version: string;
    last_updated: Date;
    popular: boolean;
    vulnerabilities: IVulnerability[];
}

const themeSchema: SchemaDefinition = {
    friendly_name: String,
    latest_version: String,
    current_version: String,
    last_updated: Date,
    popular: Boolean,
    vulnerabilities: [new Schema(vulnerabilitySchema)]
};

interface IScanResult extends Document {
    scan_id: string;
    scan_date: Date;
    statut: string;
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
    plugins: Map<string, IPlugin>;
    themes: Map<string, ITheme>;
    wordpress_vulnerabilities: IVulnerability[];
}

const scanResultSchema: Schema<IScanResult> = new mongoose.Schema({
    scan_id: { type: String, unique: true },
    scan_date: Date,
    statut: String,
    url: String,
    wordpress_version: String,
    isdirectorylisting: Boolean,
    isxmlrpc: Boolean,
    iswpcron: Boolean,
    iswplogin: Boolean,
    isregisterenable: Boolean,
    isdebuglog: Boolean,
    isoembedssrf: Boolean,
    users: [String],
    plugins: {
        type: Map,
        of: pluginSchema
    },
    themes: {
        type: Map,
        of: themeSchema
    },
    wordpress_vulnerabilities: [vulnerabilitySchema]
});

const ScanResult = mongoose.models.ScanResult || mongoose.model<IScanResult>('ScanResult', scanResultSchema);

export default ScanResult;