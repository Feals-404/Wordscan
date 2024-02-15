// mongo-init.js  
db = db.getSiblingDB('wordscan');  
  
db.createCollection('configs');  
db.configs.insert({  
    config: {  
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",  
        threads: 100,  
        ignore_code: ["403","301","302","401","404"],  
        ignore_size: ["0"],  
        apiTokens: ["0000000000000000000000000000"]  
    }  
});  
  
db.createCollection('wordlists');  
db.wordlists.insert({  
    wordlists: {  
        plugins: [""],  
        themes: [""],  
        last_sync_date: new Date(0)  
    }  
});  
  
db.createCollection('scanresults');  
db.scanresults.insert({  
    scan_id: '00000000-0000-0000-0000-000000000000',  
    scan_date: new Date(0),  
    scan_status:'',  
    url: '',  
    wordpress_version: '',  
    isdirectorylisting: false,  
    isxmlrpc: false,  
    iswpcron: false,  
    iswplogin: false,  
    isregisterenable: false,  
    isdebuglog: false,  
    isoembedssrf: false,  
    users: [],  
    plugins: {},  
    themes: {}  
});  
