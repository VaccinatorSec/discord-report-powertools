// ==UserScript==
// @name         Discord Report Powertools
// @namespace    http://vaccinator.dev
// @version      1.0.1
// @description  Makes reporting to discord much easier
// @author       Vaccinator
// @match        https://support.discord.com/hc/*/requests/new?ticket_form_id=360000029731
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        none
// ==/UserScript==


const css = `
    #drpContainer {
        border: 5px solid #6d55ce;
        padding: 5px;
        display: inline-block;
        position: absolute;
        margin-top: 10px;
        border-radius: 10px;
        color: white;
        background: #6e5db3;
    }
    
    #drpContainer:before {
        background: url('https://cdn.discordapp.com/icons/698304586481533030/8bbe1764fbea8ea3b8401461763d3de1.webp?size=32');
        position: absolute;
        width: 32px;
        height: 32px;
        top: -16px;
        left: -16px;
        display: block;
        content:  " ";
        border-radius: 999px;
    }
    
    #drpContainer h3 {
        margin-top: 10px;
    }

    .drpButton {
        border: 1px solid black;
        cursor: pointer;
        padding: 1px;
        margin: 2px;
    }

    .drpSaveButton {
        background: #21262B;
        transition: .2s ease-in-out;
        font-size: 16px;
        font-weight: 600;
        margin-right: 15px;
        color: gold;
        padding: 5px 30px 5px 30px;
        cursor: pointer;
    }

     .drpQuickReports li:hover {
        background: lightgrey;
    }

    .drpQuickReports li {
        cursor: pointer;
        border: 1px solid white;
        border-radius: 5px;
        padding: 2px 5px 2px 5px;
        margin: 2px;
        background: white;
        color: black;
    }
    
    #drpSettingsPane {
        position: fixed;
        top: 10%;
        left: 10%;
        background: white;
        padding: 10px;
        border: 1px solid black;
        width: 80%;
        height: 80%;
        z-index: 1001;
        overflow-y: scroll;
    }
    
    #drpOuterSettingsPane {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        padding: 0;
        z-index: 1000;
        background: #FFFFFFAA;
    }
    
    #drpCloseSettings {
        position: fixed;
        right: 11%;
    }
`

let impersonatedBots = {
    "Wick": "536991182035746816",
    "Captcha.bot": "512333785338216465",
    "Mee6": "159985870458322944",
};

let email = "";

let reports = [
    {
        name: "QR Verification Scam",
        focus: "request_custom_fields_360008125792",
        fields: {
            "request_custom_fields_360030385831": true,
            "request_custom_fields_360055270593": "__dc.ticket_form-tnsv1_report_abuse_or_harassment__",
            "request_custom_fields_360055270753": "__dc.ticket_form-tnsv1_cat_-_scams_fraud_prohibited_transactions__",
            "request_custom_fields_360055309973": "__dc.ticket_form-tnsv1_subcat_-_impersonation__",
            "request_custom_fields_360055309993": "__dc.ticket_form-tnsv1_a_bot__",
            "request_subject": "Fake QR code verification scam",
            "request_description": "This message is used as part of a fake verification scam - the victim is prompted to scan a QR code with their phone and therefore grant access to their account to the attacker.",
        }
    },
    {
        name: "Free Nitro OAuth Scam",
        focus: "request_custom_fields_360008125792",
        fields: {
            "request_custom_fields_360030385831": true,
            "request_custom_fields_360055270593": "__dc.ticket_form-tnsv1_report_abuse_or_harassment__",
            "request_custom_fields_360055270753": "__dc.ticket_form-tnsv1_cat_-_scams_fraud_prohibited_transactions__",
            "request_custom_fields_360055309973": "__dc.ticket_form-tnsv1_subcat_-_nitro_scam__",
            "request_subject": "Free nitro OAuth scam",
            "request_description": "This message claims to be giving away free nitro in exchange for authorising an OAuth app with 'join servers for you' permissions. This app will instead be used for adding to spam or scam servers in the future.",
        }
    },
    {
        name: "CDN Malware",
        fields: {
            "request_custom_fields_360030385831": true,
            "request_custom_fields_360055270593": "__dc.ticket_form-tnsv1_report_abuse_or_harassment__",
            "request_custom_fields_360055270753": "__dc.ticket_form-tnsv1_cat_-_cheats_hacks_malware__",
            "request_custom_fields_360055309913": "__dc.ticket_form-tnsv1_subcat_-_malware__",
            "request_custom_fields_360055309953": "__dc.trust_and_safety-malware_file_shared_via_cdn__",
            "request_subject": `Malware via CDN as of ${new Date().toDateString()}`,
            "request_description": "The following malicious files have been found to be distributed either via discord or externally, using Discord as a CDN.\n----\n"
        }
    },
    {
        name: "Game Tester Scam",
        focus: "request_custom_fields_360008125792",
        fields: {
            "request_custom_fields_360030385831": true,
            "request_custom_fields_360055270593": "__dc.ticket_form-tnsv1_report_abuse_or_harassment__",
            "request_custom_fields_360055270753": "__dc.ticket_form-tnsv1_cat_-_cheats_hacks_malware__",
            "request_custom_fields_360055309913": "__dc.ticket_form-tnsv1_subcat_-_malware__",
            "request_custom_fields_360055309953": "__dc.ticket_form-tnsv1_subsubcat_-_malicious_link_-_server__",
            "request_subject": "Fake game scam",
            "request_description": "This message is distributing a fake game, designed to trick users into downloading and running a piece of malware which steals their personal information.",
        }
    },
    {
        name: "Grabber Support Server",
        focus: "request_custom_fields_360008125792",
        fields: {
            "request_custom_fields_360030385831": true,
            "request_custom_fields_360055270593": "__dc.ticket_form-tnsv1_report_abuse_or_harassment__",
            "request_custom_fields_360055270753": "__dc.ticket_form-tnsv1_cat_-_cheats_hacks_malware__",
            "request_custom_fields_360055309913": "__dc.ticket_form-tnsv1_subcat_-_malware__",
            "request_custom_fields_360055309953": "__dc.ticket_form-tnsv1_subsubcat_-_malicious_link_-_server__",
            "request_subject": "Malware support server",
            "request_description": "This server is dedicated to distributing and providing support for malware designed to steal a victim's discord accounts.",
        }
    }
];



function getDropdownFields(id){
    const input = document.getElementById(id);

    if(!input?.dataset?.tagger)
        return [];

    try {
        return JSON.parse(input.dataset.tagger);
    }catch(e){
        console.error("[DRP] Failed to parse tagger data for", id);
        console.error(e);
        return [];
    }
}


function getFieldLabel(id){
    const label = document.getElementById(id+"_label");
    if(!label)return "";

    return label.innerText;
}

function getAllFields(){
    return Array.from(document.querySelectorAll(".form-field > label")).map((element)=>{
        return {name: element.innerText, value: element.getAttribute("for")}
    })
}
function buildReportSettingsValues(report, id){
    const output = [];
    for(let field in report.fields){
        const fieldId = `drpField${id}_${field}`;
        output.push(`<label for='${fieldId}' class='drpFieldName'>${getFieldLabel(field)} (${field})</label>`);
        const value = report.fields[field];
        const dropdown = getDropdownFields(field);
        if(dropdown.length > 0){
            output.push(`<select data-preset="${id}" name="${field}">${dropdown.map((d)=>`<option value="${d.value}" ${value === d.value ? "selected" : ""}>${d.label}</option>`).join("")}</select>`)
        }else if(typeof value === "boolean"){
            output.push(`<input type='checkbox' checked="${value}" id="${fieldId}" name="${field}" data-preset="${id}"/>`)
        }else if(value.length < 100){
            output.push(`<input type='text' value="${value}" id="${fieldId}" name="${field}" data-preset="${id}"/>`)
        }else{
            output.push(`<textarea id="${fieldId}" name="${field}" data-preset="${id}">${value}</textarea>`)
        }
    }

    output.push(`<label for='drpFocussed${id}'>Focussed Field (Optional)</label>`);
    output.push(`<p>Highlights a specific field, so you can immediately paste into it.</p>`);
    output.push(`<select name="focus" data-preset="${id}">
        <option value="" ${!report.focus ? "selected" : ""}>None</option>
        ${getAllFields().map((f)=>`<option value="${f.value}" ${report.focus === f.value ? "selected" : ""}>${f.name}</option>`)}
    </select>`)

    return output.join("<br/>");
}

const settingsPanes = {
    presets: ()=>`
        <h1>Presets</h1>
        <div id="drpPresetSettings">
            ${reports.map((report, i)=>`
                <details>
                    <summary>${report.name}</summary>
                    <p>${buildReportSettingsValues(report, i)}</p>
                    <button onclick="drpSavePreset(${i})">Save</button><button  onclick="drpDeletePreset(${i})">Delete</button>
                </details>
            `).join("<hr/>")}
            <i>To add a new preset, set up the report the way you want it and hit 'Save Preset'</i>
        </div>
    `,
    new: ()=>`
        <h1>New Preset</h1>
        <label for="drpNewPresetName">Name</label>
        <input type="text" placeholder="Preset #${reports.length+1}" id="drpNewPresetName"/>
        <textarea>${JSON.stringify(getCurrentFormValues())}</textarea>
        <label for='drpNewFocussed'>Focussed Field (Optional)</label>
        <p>Highlights a specific field, so you can immediately paste into it.</p>
        <select name="focus" id="drpNewFocussed">
            <option value="">None</option>
            ${getAllFields().map((f) => `<option value="${f.value}">${f.name}</option>`)}
        </select>
        <button onclick="drpNewPreset()">Save</button>
    `
}

document.drpDeletePreset = function drpDeletePreset(id){
    if(!confirm("Are you sure you want to delete this preset?"))return;
    console.log(reports.splice(id, 1));
    savePresets();
    document.drpOpenSetting("presets");
}

document.drpSavePreset = function drpSavePreset(id){
    const elements = Array.from(document.querySelectorAll(`[data-preset="${id}"]`));
    reports[id] = {
        ...reports[id],
        fields: elements.filter((e)=>e.name !== 'focus').reduce(( acc, e)=>{acc[e.name] = e.value || e.checked; return acc;}, {}),
        focus: elements.find((e)=>e.name === 'focus')?.name || ""
    };
    savePresets();
    alert("Saved!");
}
document.drpNewPreset = function(){
    const name = document.getElementById("drpNewPresetName").value;
    const focus = document.getElementById("drpNewFocussed")?.value;
    reports.push({
        name,
        fields: getCurrentFormValues(),
        focus
    });
    savePresets();
    this.drpCloseSetting();
}

document.drpQuickReport = function drpQuickReport(index){
    if(!reports[index])return console.error("[DRP] Couldn't find preset #", index);
    const emailField = document.getElementById("request_anonymous_requester_email");
    if(emailField && email.length > 0) {
        emailField.value = email;
    }
    const report = reports[index];
    const map = report.fields;
    for(let field in map){
        if(typeof map[field] === "boolean"){
            document.getElementById(field).checked = map[field];
        }else{
            document.getElementById(field).value = map[field];
        }
    }
    if(report.focus) {
        document.getElementById(report.focus)?.focus();
    }
};

document.drpFillBot = function(bot){
    document.getElementById("request_custom_fields_360055310893").value = impersonatedBots[bot];
};


document.drpCloseSetting = function(){
    const openSettings = document.getElementById("drpOuterSettingsPane");
    if(openSettings)
        openSettings.remove();
}

document.drpOpenSetting = function(setting){
    this.drpCloseSetting();
    const newSettingsPane = document.createElement("div");
    newSettingsPane.id = "drpOuterSettingsPane";
    newSettingsPane.onclick = ()=>document.drpCloseSetting();
    newSettingsPane.innerHTML = `<div id='drpSettingsPane' onclick="event.stopPropagation()"><button id='drpCloseSettings' onClick='drpCloseSetting()'> X</button>${settingsPanes[setting]()}</div>`;
    document.getElementsByTagName("body")[0].appendChild(newSettingsPane);
}


document.drpSetEmail = function(){
    const newEmail = prompt("Set your default email (for being logged out)", email);
    localStorage.setItem("__drpEmail", newEmail);
    email = newEmail;
    alert("Set!");
}

function getCurrentFormValues(){
    const vals = Array.from(document.querySelectorAll("#new_request input, #new_request select, #new_request textarea")).filter((e)=>!e.hidden && e.id.length > 0 && (e.value.length > 0 || e.checked));
    return vals.reduce((acc, e)=>{acc[e.id] = e.value; return acc}, {});
}

function buildControls(){
    return `<div id="drpContainer">
    <h1>Powertools</h1>
    <h3>Quick Report</h3>
    <ul class="drpQuickReports">
        ${reports.map((report, i)=>`<li onclick="drpQuickReport(${i})">${report.name}</li>`).join("")}
    </ul>
    <h3>Settings</h3>
    <ul class="drpQuickReports">
        <li onclick="drpOpenSetting('presets')">Manage Presets</li>
        <li onclick="drpOpenSetting('bots')">Manage Bots</li>
        <li onclick="drpSetEmail()">Default Email</li>
    </ul>
</div>`;
}

function firstTimeSetup(){
    console.log("[DRP] Performing first time setup");
    localStorage.setItem("__drpPresets", JSON.stringify(reports));
    localStorage.setItem("__drpBots", JSON.stringify(impersonatedBots));
}

function loadSettings(){
    console.log("[DRP] Loading settings");
    try{
        reports = JSON.parse(localStorage.getItem("__drpPresets"));
        impersonatedBots = JSON.parse(localStorage.getItem("__drpBots"));
        email = localStorage.getItem("__drpEmail") || "";
    }catch(e){
        alert("DRP Failed to load settings. Check console. Clear local storage to reset.");
        console.error("[DRP] There was an error loading settings");
        console.error(e);
    }
}

// Saves and reloads the settings
function savePresets(){
    localStorage.setItem("__drpPresets", JSON.stringify(reports));
    document.getElementById("drpControlsContainer").innerHTML = buildControls();
}

(function() {
    'use strict';

    if(localStorage.getItem("__drpPresets")){
        loadSettings();
    }else{
        firstTimeSetup();
    }

    const head = document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.innerText = css;
    head.appendChild(style);

    const reportForm = document.getElementsByClassName("search-container")[0];
    if(!reportForm){
        console.error("[DRP] Couldn't find main-content!");
        return;
    }
    const container = document.createElement("div");
    container.id = "drpControlsContainer";
    container.innerHTML = buildControls();
    reportForm.appendChild(container);


    const botImpersonation = document.getElementsByClassName("request_custom_fields_360055310893")[0];
    if(!botImpersonation)return;
    const botSelectorContainer = document.createElement("div");
    botSelectorContainer.innerHTML = Object.keys(impersonatedBots).map((b)=>`<span class="drpButton" onclick="drpFillBot('${b}')">${b}</span>`).join(" ");
    botImpersonation.appendChild(botSelectorContainer);

    const savePreset = document.getElementsByTagName("footer")[0];
    const savePresetButton = document.createElement("span");
    //savePresetButton.onclick = "drpSavePreset";
    savePresetButton.className = "drpSaveButton";
    savePresetButton.innerText = "Save Preset";
    savePresetButton.onclick = ()=>document.drpOpenSetting("new");
    savePreset.prepend(savePresetButton);

})();