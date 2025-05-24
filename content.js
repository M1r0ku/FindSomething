// @Date    : 2025-05-25 12:00:00
// @Author  : residuallaugh / M1r0ku

(function(){
    var protocol = window.location.protocol;
    var host = window.location.host;
    var domain_host = host.split(':')[0];
    var href = window.location.href;
    // var source = document.getElementsByTagName('html')[0].innerHTML;
    var source = document.documentElement.outerHTML;
    var settingSafeMode = true;
    init_source(source);

    // 获取页面中所有的 iframe 元素，执行同样的逻辑
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(iframe) {
        iframe.addEventListener('load', function() {
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            source = iframeDocument.documentElement.outerHTML
            // console.log(iframeDocument.documentElement.outerHTML);
            init_source(source);
        });
    });

    function init_source(source) {
        var hostPath;
        var urlPath;
        var urlWhiteList = ['.google.com','.amazon.com','portswigger.net'];
        var target_list = [];
        // console.log(source)
        var source_href = source.match(/href=['"].*?['"]/g);
        var source_src = source.match(/src=['"].*?['"]/g);
        var script_src = source.match(/<script [^><]*?src=['"].*?['"]/g);
        chrome.storage.local.get(["settingSafeMode"], function(settings){
            settingSafeMode = settings["settingSafeMode"]==false ? false : true;
        });
        chrome.storage.local.get(["allowlist"], function(settings){
            // console.log(settings , settings['allowlist'])
            if(settings && settings['allowlist']){
                urlWhiteList = settings['allowlist'];
            }
            for(var i = 0;i < urlWhiteList.length;i++){
                if(host.endsWith(urlWhiteList[i]) || domain_host.endsWith(urlWhiteList[i])){
                    console.log('域名在白名单中，跳过当前页')
                    return ;
                }
            }
            // target_list.push(window.location.href);
            
            // console.log(source_href,source_src,script_src)
            if(source_href){
                for(var i=0;i<source_href.length;i++){
                    var u = deal_url(source_href[i].substring(6,source_href[i].length-1));
                    if(u){
                        target_list.push(u);
                    }
                }
            }
            if(source_src){
                for(var i=0;i<source_src.length;i++){
                    var u = deal_url(source_src[i].substring(5,source_src[i].length-1));
                    if(u){
                        target_list.push(u);
                    }
                }
            }
            
            const tmp_target_list=[];
            for (var i = 0;i<target_list.length;i++){
                if (tmp_target_list.indexOf(target_list[i])===-1){
                  tmp_target_list.push(target_list[i])
                }
            }
            tmp_target_list.pop(href)
            chrome.runtime.sendMessage({greeting: "find",data: target_list, current: href, source: source});
        });
    
        function is_script(u){
            if(script_src){
                for(var i=0;i<script_src.length;i++){
                    if (script_src[i].indexOf(u)>0){
                        return true
                    }
                }
            }
            return false
        }
        function isJavaScriptFile(url) {
            try {
                // 使用URL构造函数解析URL
                const parsedUrl = new URL(url);

                // 获取URL的pathname部分
                const pathname = parsedUrl.pathname;

                // 检查pathname是否以.js结尾
                return pathname.endsWith('.js');
            } catch (error) {
                // 如果URL无效，则捕获错误
                return false;
            }
        }

        function deal_url(u){
            let url;
            if(u.substring(0,4)=="http"){
                url = u;
            }
            else if(u.substring(0,2)=="//"){
                url = protocol+u;
            }
            else if(u.substring(0,1)=='/'){
                url = protocol+'//'+host+u;
            }
            else if(u.substring(0,2)=='./'){
                if (href.indexOf('#')>0) {
                    tmp_href = href.substring(0,href.indexOf('#'))
                }else{
                    tmp_href = href;
                }
                url = tmp_href.substring(0,tmp_href.lastIndexOf('/')+1)+u;
            }else{
                // console.log("not match prefix:"+u+",like http // / ./")
                if (href.indexOf('#')>0) {
                    tmp_href = href.substring(0,href.indexOf('#'))
                }else{
                    tmp_href = href;
                }
                url = tmp_href.substring(0,tmp_href.lastIndexOf('/')+1)+u;
            }
            // console.log(settingSafeMode)
            if(settingSafeMode && !isJavaScriptFile(url) && !is_script(u)){
                // console.log('非js:'+u);
                // if(u.indexOf('.js')>-1){
                //     console.log('有js关键字:'+u);
                // }
                return ;
            }
            // console.log(url)
            return url;
        }
    }

})()


/*   全局悬浮窗样式   */

chrome.storage.local.get(["global_float"], function(settings){
    if (settings["global_float"]!=true){
        return
    }

    const body = document.getElementsByTagName('html')[0];
    const div = document.createElement('div');
    div.setAttribute("id","findsomething-float-div");

    // All styling moved inline or to the embedded <style> tag
    div.innerHTML = `
    <findsomething-div id="findsomething_neko" style="
        width:410px;
        max-height:500px;
        font-size:14px;
        color:#343a40; /* Darker text for readability */
        box-shadow: 0 8px 30px rgba(0,0,0,0.2); /* Deeper, softer shadow */
        background-color: #ffffff; /* Clean white background */
        border-radius: 12px; /* Nicer rounded corners */
        border: 1px solid #e0e0e0; /* Subtle light gray border */
        left:20px;
        top:20px;
        position: fixed;
        z-index: 1000000;
        overflow-y:auto; /* Use overflow-y for vertical scrolling */
        overflow-x:hidden; /* Hide horizontal scroll if not needed */
        display: flex; /* Use flexbox for internal layout */
        flex-direction: column; /* Stack items vertically */
        font-family: 'Roboto', sans-serif; /* Consistent font */
        padding-bottom: 10px; /* Add some padding at the bottom */
    ">
        <findsomething-div id="findsomething_neko-title" style="
            display: flex;
            justify-content: space-between;
            align-items: center; /* Vertically align items */
            padding: 10px 15px; /* Padding for the header */
            background-color: #f8f9fa; /* Light grey background for header */
            border-bottom: 1px solid #e9ecef; /* Subtle separator line */
            border-top-left-radius: 11px; /* Match main border-radius - 1px */
            border-top-right-radius: 11px; /* Match main border-radius - 1px */
            flex-shrink: 0; /* Prevent header from shrinking */
        ">
            <findsomething-div id="findsomething_taskstatus" style="
                height: 34px;
                line-height: 34px;
                margin-left: 0px; /* Remove redundant margin-left if padding handles it */
                font-weight: 500; /* Medium bold for status */
                color: #555; /* Softer color for status text */
                font-size: 15px;
            "></findsomething-div>
            <findsomething-div style="
                cursor: pointer;
                margin-top: 0px; /* Adjust top margin for better alignment */
                margin-right: 0px; /* Adjust right margin for better alignment */
                font-size: 14px;
                color: #6c757d; /* Muted gray for elegance */
                padding: 5px 10px; /* Padding for click area */
                border-radius: 5px; /* Slightly rounded button */
                transition: background-color 0.2s ease, color 0.2s ease;
            " onclick='(function(){document.getElementById("findsomething-float-div").removeChild(document.getElementById("findsomething_neko"));})()'>隐藏</findsomething-div>
        </findsomething-div>

        <findsomething-div style="
            width: auto; /* Let content fill available width */
            margin-top: 15px; /* More space from header */
            padding: 0 15px; /* Padding on sides for content */
            flex-grow: 1; /* Allow content area to grow */
            overflow-y: auto; /* Enable scroll if content is too long */
            box-sizing: border-box; /* Include padding in width */
        ">
            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">Path<button class="findsomething_copy" name="path">复制</button></findsomething-div>
                <findsomething-p id="findsomething_path">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">IP<button type="button" class="findsomething_copy" name="ip">复制</button></findsomething-div>
                <findsomething-p id="findsomething_ip">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">IP & PORT<button class="findsomething_copy" name="ip_port">复制</button></findsomething-div>
                <findsomething-p id="findsomething_ip_port">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">域名<button class="findsomething_copy" name="domain">复制</button></findsomething-div>
                <findsomething-p id="findsomething_domain">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">身份证<button class="findsomething_copy" name="sfz">复制</button></findsomething-div>
                <findsomething-p id="findsomething_sfz">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">手机号<button class="findsomething_copy" name="mobile">复制</button></findsomething-div>
                <findsomething-p id="findsomething_mobile">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">邮箱<button class="findsomething_copy" name="mail">复制</button></findsomething-div>
                <findsomething-p id="findsomething_mail">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">JWT<button class="findsomething_copy" name="jwt">复制</button></findsomething-div>
                <findsomething-p id="findsomething_jwt">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">算法<button class="findsomething_copy" name="algorithm">复制</button></findsomething-div>
                <findsomething-p id="findsomething_algorithm">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">敏感信息<button class="findsomething_copy" name="secret">复制</button></findsomething-div>
                <findsomething-p id="findsomething_secret">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">残缺路径<button class="findsomething_copy" name="incomplete_path">复制</button></findsomething-div>
                <findsomething-p id="findsomething_incomplete_path">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">URL<button class="findsomething_copy" name="url">复制</button></findsomething-div>
                <findsomething-p id="findsomething_url">🈚️</findsomething-p>
            </findsomething-div>

            <findsomething-div class="findsomething-item-group">
                <findsomething-div class="findsomething-title">静态资源<button class="findsomething_copy" name="static">复制</button></findsomething-div>
                <findsomething-p id="findsomething_static">🈚️</findsomething-p>
            </findsomething-div>
        </findsomething-div>
    </findsomething-div>
    <style type="text/css">
        /* Custom tags need to be block-level */
        findsomething-div {
            display: block;
        }
        findsomething-p {
            display: block;
            margin-top: 8px; /* Reduced top margin */
            margin-bottom: 8px; /* Reduced bottom margin */
            line-height: 1.5; /* Better readability for paragraphs */
            word-break: break-word; /* Ensure long words break */
            padding-left: 10px; /* Indent content slightly */
            color: #495057; /* Softer text color for content */
        }

        /* Grouping for each item (Title + Paragraph) */
        .findsomething-item-group {
            margin-bottom: 15px; /* Space between different data items */
        }
        .findsomething-item-group:last-child {
            margin-bottom: 0; /* No margin after the last item */
        }


        .findsomething-title {
            font-size: 15px; /* Slightly adjusted font size */
            font-weight: 700; /* Bolder titles */
            border-left: 4px solid #007bff; /* Blue border for titles */
            text-indent: 8px; /* More indent for text */
            height: auto; /* Let height adjust to content */
            line-height: 1.2; /* Tighter line height for titles */
            width: 100%;
            margin-left: 0px; /* Remove margin-left as padding handles it */
            color: #343a40; /* Darker title color */
            padding: 2px 0; /* Small vertical padding for titles */
            display: flex; /* Use flex to align title and button */
            align-items: center; /* Vertically center content */
            justify-content: space-between; /* Push button to the right */
        }
        
        /* Copy button style */
        .findsomething_copy {
            border-style: none;
            background-color: #007bff; /* Blue background for copy buttons */
            color: #ffffff; /* White text */
            padding: 4px 10px; /* Padding for button */
            border-radius: 4px; /* Rounded corners for buttons */
            cursor: pointer;
            font-size: 12px; /* Smaller font for button text */
            transition: background-color 0.2s ease, transform 0.1s ease; /* Smooth transition */
            flex-shrink: 0; /* Prevent button from shrinking */
            margin-right: 5px; /* Small margin from right edge */
        }

        .findsomething_copy:hover {
            background-color: #0056b3; /* Darker blue on hover */
            transform: translateY(-1px); /* Slight lift on hover */
        }

        .findsomething_copy:active {
            transform: translateY(0); /* Press effect */
        }

        button {
            cursor: pointer;
        }

        /* Scrollbar styling for WebKit browsers */
        #findsomething_neko::-webkit-scrollbar {
            width: 8px;
        }

        #findsomething_neko::-webkit-scrollbar-track {
            background: #f0f2f5; /* Light track background */
            border-radius: 4px;
        }

        #findsomething_neko::-webkit-scrollbar-thumb {
            background-color: #c0c0c0; /* Gray thumb */
            border-radius: 4px;
            border: 2px solid #f0f2f5; /* Border to create visual space */
        }

        #findsomething_neko::-webkit-scrollbar-thumb:hover {
            background-color: #a0a0a0; /* Darker gray on hover */
        }
    </style>
    `
    body.appendChild(div)
    
    var neko = document.querySelector('#findsomething_neko');
    var nekoW = neko.offsetWidth;
    var nekoH = neko.offsetHeight;
    var cuntW = 0;
    var cuntH = 0;
    neko.style.left = parseInt(document.body.offsetWidth - nekoW)+1 + 'px';
    neko.style.top = '50px';
    move(neko, 0, 0);
    function move(obj, w, h) {
        if (obj.direction === 'left') {
            obj.style.left = 0 - w + 'px';
        } else if (obj.direction === 'right') {

            obj.style.left = document.body.offsetWidth - nekoW + w + 'px';
        }
        if (obj.direction === 'top') {
            obj.style.top = 0 - h + 'px';
        } else if (obj.direction === 'bottom') {
            obj.style.top = document.body.offsetHeight - nekoH + h + 'px';
        }
    }

    function rate(obj, a) {
        //  console.log(a);
        obj.style.transform = ' rotate(' + a + ')'
    }

    var nekotitle = document.querySelector('#findsomething_neko-title');
    nekotitle.onmousedown = function (e) {
        var nekoL = e.clientX - neko.offsetLeft;
        var nekoT = e.clientY - neko.offsetTop;
        document.onmousemove = function (e) {
            cuntW = 0;
            cuntH = 0;
            neko.direction = '';
            neko.style.transition = '';
            neko.style.left = (e.clientX - nekoL) + 'px';
            neko.style.top = (e.clientY - nekoT) + 'px';
            if (e.clientX - nekoL < 5) {
                neko.direction = 'left';
            }
            if (e.clientY - nekoT < 5) {
                neko.direction = 'top';
            }
            if (e.clientX - nekoL > document.body.offsetWidth - nekoW - 5) {
                neko.direction = 'right';
            }
            if (e.clientY - nekoT > document.body.offsetHeight - nekoH - 5) {
                neko.direction = 'bottom';
            }

            move(neko, 0, 0);


        }
    }
    neko.onmouseover = function () {
        move(this, 0, 0);
        rate(this, 0)
    }

    neko.onmouseout = function () {
        // move(this, nekoW / 2, nekoH / 2);
        move(this, nekoW / 2, 0);
        // move(this, 0, 0);
    }

    neko.onmouseup = function () {
        document.onmousemove = null;
        this.style.transition = '.5s';
        // move(this, nekoW / 2, nekoH / 2);
        move(this, nekoW / 2, 0);
    }

    window.onresize = function () {
        var bodyH = document.body.offsetHeight;
        var nekoT = neko.offsetTop;
        var bodyW = document.body.offsetWidth;
        var nekoL = neko.offsetLeft;

        if (nekoT + nekoH > bodyH) {
            neko.style.top = bodyH - nekoH + 'px';
            cuntH++;
        }
        if (bodyH > nekoT && cuntH > 0) {
            neko.style.top = bodyH - nekoH + 'px';
        }
        if (nekoL + nekoW > bodyW) {
            neko.style.left = bodyW - nekoW + 'px';
            cuntW++;
        }
        if (bodyW > nekoL && cuntW > 0) {
            neko.style.left = bodyW - nekoW + 'px';
        }

        // move(neko, nekoW / 2, nekoH / 2);
        move(this, nekoW / 2, 0);
        // move(this, 0, 0);
    }
});

function init_copy() {
    var elements = document.getElementsByClassName("findsomething_copy");
    if (elements) {
        for (var i=0, len=elements.length|0; i<len; i=i+1|0) {
            let ele_name = elements[i].name;
            elements[i].onclick=function () {
                // console.log('copy begin');
                var inp =document.createElement('textarea');
                document.body.appendChild(inp)
                inp.value =document.getElementById(ele_name).textContent;
                inp.select();
                document.execCommand('copy',false);
                inp.remove();
                // console.log('copy end');
            }
        }
    }
};
setTimeout(()=>{
    init_copy();
}, 500);

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

var key = ["ip","ip_port","domain","path","incomplete_path","url","static","sfz","mobile","mail","jwt","algorithm","secret"]

function show_info(result_data) {
    if(result_data){
        for (var k in key){
            if (result_data[key[k]]){
                // console.log(result_data[key[k]])
                let p="";
                for(var i in result_data[key[k]]){
                    p = p + result_data[key[k]][i] +'\n'
                }
                document.getElementById("findsomething_"+key[k]).style.whiteSpace="pre";
                document.getElementById("findsomething_"+key[k]).textContent=p;
            }
        }
    }
}
function get_info() {
    chrome.runtime.sendMessage({greeting: "get", current: window.location.href}, function(result_data) {
        let taskstatus = document.getElementById('findsomething_taskstatus');
        if(!taskstatus){
            return;
        }
        if(!result_data|| result_data['done']!='done'){
            // console.log('还未提取完成');
            if(result_data){
                show_info(result_data);

                taskstatus.textContent = "处理中.."+result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
            }else{
                taskstatus.textContent = "处理中..";
            }
            sleep(100);
            get_info();
            return;
        }
        taskstatus.textContent = "处理完成："+result_data['donetasklist'].length+"/"+result_data['tasklist'].length;
        show_info(result_data);
        // 结果不一致继续刷新
        if(result_data['donetasklist'].length!=result_data['tasklist'].length){
            get_info();
        }
        return;
    });
}
get_info();