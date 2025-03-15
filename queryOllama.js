//const OllamaApiModel = require('./ollamaApiModelService');
//const fs = require('fs');

//const OLLAMA_URL = "http://localhost";
//const OLLAMA_PORT = 11434;
//const MODEL = "llama3.2:3b"; // Change selon le modèle dispo
//const PROMPT_INTRO = "Analyse et explique les logs trouvés dans ces fichiers Java :\n\n";

async function runQuery() {
    //const ollama = new OllamaApiModel(OLLAMA_URL, OLLAMA_PORT, MODEL, null);

        
        // Vérifier si le fichier des changements existe
        let logsData = "Aucun logs trouvés.";
        if (fs.existsSync('logs_extracted.txt')) {
            logsData  = fs.readFileSync('logs_extracted.txt', 'utf8');
        }

        console.log("Voici les changements: "+logsData );
    }