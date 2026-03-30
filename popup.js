// @Date    : 2026-03-30 16:00:00
// @Author  : residuallaugh / M1r0ku

function setTextContentById(id){
    const element = document.getElementById(id);
    if (element) {
        element.textContent = chrome.i18n.getMessage(id);
    }
}

function init_locales() {
    const popupIdList = [
        "popupIp",
        "popupIpPort",
        "popupDomain",
        "popupSfz",
        "popupMobile",
        "popupMail",
        "popupJwt",
        "popupAlgorithm",
        "popupSecret",
        "popupPath",
        "popupIncompletePath",
        "popupUrl",
        "popupStaticPath",
        "Peizhi"
    ];

    for (const id of popupIdList) {
        try{
            setTextContentById(id)
        }catch(e){
            console.error(`Error setting text content for ID ${id}:`, e);
        }
    }
}

init_locales();

var key = ["ip","ip_port","domain","path","incomplete_path","url","static","sfz","mobile","mail","jwt","algorithm","secret"];

function init_copy() {
    var elements = document.getElementsByClassName("copy-button");
    if(elements){
        for (var i=0, len=elements.length|0; i<len; i=i+1|0) {
            elements[i].textContent = chrome.i18n.getMessage("popupCopy");
            let ele_name = elements[i].name;
            let ele_id = elements[i].id;
            if (ele_id == "popupCopyurl"){
                elements[i].textContent = chrome.i18n.getMessage("popupCopyurl");
            }
            elements[i].onclick=function () {
                var inp =document.createElement('textarea');
                document.body.appendChild(inp);
                var copytext = document.getElementById(ele_name).textContent;
                if (ele_id == "popupCopyurl"){
                    Promise.all([getCurrentTab().then(function x(tab){
                        if(tab == undefined){
                            alert(chrome.i18n.getMessage("popupTipClickBeforeCopy"));
                            return;
                        }
                        var url = new URL(tab.url);
                        var path_list = copytext.split('\n').filter(line => line.trim() !== 'No data' && line.trim() !== '');
                        copytext = "";
                        for (var i = 0; i < path_list.length; i++) {
                            let item = path_list[i].trim();
                            if (!item) continue;
                            try {
                                const resolvedUrl = new URL(item, tab.url);
                                copytext += resolvedUrl.href + '\n';
                            } catch (e) {
                                console.warn(`路径解析失败: ${item}`, e);
                                // fallback（兼容旧逻辑）
                                if(item.startsWith('/')){
                                    copytext += url.origin + item + '\n';
                                } else {
                                    const currentPath = url.pathname;
                                    const lastSlashIndex = currentPath.lastIndexOf('/');
                                    const basePath = (lastSlashIndex !== -1) ? currentPath.substring(0, lastSlashIndex + 1) : '/';
                                    copytext += url.origin + basePath + item + '\n';
                                }
                            }
                        }
                        inp.value = copytext.slice(0, -1);
                        inp.select();
                        document.execCommand('copy',false);
                    })]).then(res=> inp.remove());
                    return ;
                }
                if (copytext === 'No data') {
                    inp.remove();
                    return;
                }
                inp.value = copytext;
                inp.select();
                document.execCommand('copy',false);
                inp.remove();
            }
        }
    }
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function show_info(result_data) {
    for (var k in key){
        let currentKey = key[k];
        let container = document.getElementById(currentKey);
        if (!container) {
            continue;
        }
        // Clear existing content
        while(container.firstChild){
            container.firstChild.remove();
        }
        if (result_data && result_data[currentKey] && result_data[currentKey].length > 0){
            container.classList.remove('no-data');
            for (var i in result_data[currentKey]){
                let itemText = result_data[currentKey][i];
                let link = document.createElement("a");
                let source = result_data['source'] ? result_data['source'][itemText] : null;
                if (source) {
                    link.setAttribute("href", source);
                    link.setAttribute("title", source);
                    link.setAttribute("target", "_blank");
                    link.setAttribute("rel", "noopener noreferrer");
                }
                let span = document.createElement("span");
                span.textContent = itemText;
                if (source) {
                    let tips = document.createElement("div");
                    tips.setAttribute("class", "tips");
                    link.appendChild(tips);
                    link.appendChild(span);
                    container.appendChild(link);
                    container.appendChild(document.createTextNode('\n'));
                } else {
                    container.appendChild(span);
                    container.appendChild(document.createTextNode('\n'));
                }
            }
        } else {
            container.textContent = '🈚️';
            container.classList.add('no-data');
        }
    }
}

function handleCategoryClick(event) {
    event.preventDefault(); // Prevent default link behavior

    // Remove active class from all category items
    document.querySelectorAll('.category-item a').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to the clicked item
    event.currentTarget.classList.add('active');

    const selectedCategory = event.currentTarget.dataset.category;
    const infoCardsContainer = document.getElementById('info-cards-container');

    // Hide all info cards initially
    infoCardsContainer.style.display = 'block';

    document.querySelectorAll('.info-card').forEach(card => {
        if (card.id === `card-${selectedCategory}`) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function init_category_navigation() {
    const categoryLinks = document.querySelectorAll('.category-item a');
    categoryLinks.forEach(link => {
        if (link.id === 'Peizhi') { // Special handling for "配置"
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default navigation
                window.location.href = 'settings.html'; // Navigate to settings.html
            });
        } else {
            link.addEventListener('click', handleCategoryClick);
        }
    });

    // Initially activate and display the "Path" category
    const initialCategoryLink = document.querySelector('.category-item a[data-category="path"]');
    if (initialCategoryLink) {
        initialCategoryLink.classList.add('active');
        const selectedCategory = initialCategoryLink.dataset.category;
        document.querySelectorAll('.info-card').forEach(card => {
            if (card.id === `card-${selectedCategory}`) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

getCurrentTab().then(function get_info(tab) {
    if (!tab || !tab.url) {
        document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupNoDataAvailable");
        return;
    }
    chrome.storage.local.get(["findsomething_result_"+tab.url], function(result) {
        if (!result || !result["findsomething_result_"+tab.url]){
            document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupNoDataAvailable");
            return;
        }
        const result_data = result["findsomething_result_"+tab.url];
        show_info(result_data);
        if(result_data.donetasklist){
            if(result_data['done']!='done'){
               document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupProcessing") + result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
            }else{
                document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupComplete") + result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
            }
        }else{
            document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupProcessing");
        }
    });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    getCurrentTab().then(function get_info(tab) {
        if (!tab || !tab.url) {
            return;
        }
        for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
            if(key=="findsomething_result_"+tab.url){
                const result_data = newValue;
                show_info(result_data);
                if(result_data.donetasklist){
                    if(result_data['done']!='done'){
                       document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupProcessing") + result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
                    }else{
                        document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupComplete") + result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
                    }
                }else{
                    document.getElementById('taskstatus').textContent = chrome.i18n.getMessage("popupProcessing");
                }
            }
        }
    });
});

init_copy();
init_category_navigation();
