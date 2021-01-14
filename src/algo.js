// Main Area Elements
const title = document.getElementById("header-title");
const convBox = document.getElementById("conversion-type");
const pathInput = document.getElementById("path-input");
const fileButton = document.getElementById("file-path-button");
const folderButton = document.getElementById("folder-path-button");
const outputFormat = document.getElementById("output-format");
const convButton = document.getElementById("convert-button");

convButton.style.cursor = "pointer";
convButton.onclick = convertFile;

fileButton.onclick = selectFile;
folderButton.onclick = selectFolder;

// To be hardcoded
const imageInputFormats = ["jpg", "jpeg", "png", "gif", "svg", "webp", "ico"];
const imageOutputFormats = ["jpg", "jpeg", "png", "gif", "svg", "webp", "ico"];
const videoInputFormats = ["mp3", "test", "test"];
const videoOutputFormats = ["mov", "test", "test"];
const audioInputFormats = ["mp3", "test", "test"];
const audioOutputFormats = ["mp3", "wav", "flac"];
const documentInputFormats = ["test", "test", "test"];
const documentOutputFormats = ["test", "test", "test"];
const ebookInputFormats = ["test", "test", "test"];
const ebookOutputFormats = ["test", "test", "test"];
//
const typeMapping = {
    "img": {"input": imageInputFormats, "output": imageOutputFormats, "name": "Image"},
    "vid": {"input": videoInputFormats, "output": videoOutputFormats, "name": "Video"},
    "aud": {"input": audioInputFormats, "output": audioOutputFormats, "name": "Audio"},
    "doc": {"input": documentInputFormats, "output": documentOutputFormats, "name": "Document"},
    "ebook": {"input": ebookInputFormats, "output": ebookOutputFormats, "name": "Ebook"}
};

// Required Node Modules
const convert = require("media-converter");
const {remote} = require("electron");
const {dialog} = remote;
const path = require("path");
const EventEmitter = require("events");
const fs = require("fs");
const openExplorer = require('open-file-explorer');

// Events
// const emitter = new EventEmitter();
// convBox.onchange = emitter.emit('inputOptionSelected');
// emitter.on('inputOptionSelected', () => console.log("Success"));

convBox.addEventListener('change', () => load(convBox.value));

function load(arg)
{
        title.textContent = `Convert ${typeMapping[arg]["name"]}`;
        convBox.value = arg;
        loadOptions(typeMapping[arg]["output"]);
}

function loadOptions(outputArray)
{
    removeOutputs();
    for (let i=0; i < outputArray.length; i++)
    {
        // Output Set
        let outputOption = document.createElement("option");
        outputOption.value = outputArray[i];
        outputOption.id = i.toString();
        outputOption.textContent = outputArray[i];
        outputFormat.appendChild(outputOption);
    }
}
function loadHome()
{
    title.textContent = "Convert";
    convBox.value = "null";
    pathInput.value = "";
    removeOutputs();

}
function removeOutputs()
{
    for(let option in outputFormat.options)
    {
        outputFormat.options.remove(0);
    }
}
function convertFile()
{
    let type = convBox.value;
    let inputFile = pathInput.value;
    let ext = path.extname(inputFile);
    let dirName = path.dirname(inputFile);
    let outputFile = path.join(path.dirname(inputFile), path.basename(inputFile, `${ext}`))+'.'+ outputFormat.value;
    console.log(outputFile);
    console.log(inputFile);
    console.log("Dir Name: " + dirName);
    let inputArray;
    inputArray = typeMapping[type]["input"];
    console.log(ext);
    console.log(inputArray);
    if (inputArray.includes(ext.slice(1))) {
        try {
            convert(inputFile, outputFile, () => console.log("Conversion Successful"));
        } catch (e) {
            dialog.showErrorBox("Conversion Error", e);
        }
        const completeNotification = new Notification('Conversion Complete', {body: 'Your file has been converted successfully.\nClick to open in folder.'});
        completeNotification.addEventListener('click',() => openFolder(dirName));
    }
    else{
        console.log("Extension Error: Extension not supported.");
        dialog.showErrorBox("Extension Error", "The extension of the input file you have selected is not supported by this program.");
    }
}

async function selectFile()
{
    let type = convBox.value;
    let file = await dialog.showOpenDialog({
        title: "Select File",
        properties: ['openFile', "createDirectory"],
        defaultPath: "C:/",
        filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Images', extensions: imageInputFormats },
            { name: 'Videos', extensions: videoInputFormats },
            { name: 'Audios', extensions: audioInputFormats },
            { name: 'Documents', extensions: documentInputFormats },
            { name: 'Ebooks', extensions: ebookInputFormats }
        ]
    });
    console.log(file.filePaths[0]);
    pathInput.value = file.filePaths[0];
}
async function selectFolder()
{
    let file = await dialog.showOpenDialog({
        title: "Select Folder",
        properties: ["createDirectory", "openDirectory"],
        defaultPath: "C:/"
    });
    console.log(file.filePaths[0]);
    pathInput.value = file.filePaths[0];
}
function openFolder(folderName)
{
    openExplorer(folderName, err => {
        if (err){
            dialog.showErrorBox("Path Error", "There is a problem with the path of the directory you have chosen.");        }
        else {
            console.log("Explorer opened successfully.")
        }

    })
}