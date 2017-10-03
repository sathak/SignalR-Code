var minloadMsgCount = 10;
var maxloadMsgCount = 0;
$(document).ready(function () {
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (val) {
            return jQuery.inArray(val, this);
        };
    }
    $(".modal").hide();

    $(window).on('beforeunload', function () {
        //$.connection.myHub.connection.stop();
        //$.connection.hub.stop();
        $(".modal").show()
    });


});
function callChatModule() {


    chatHub = $.connection.chatHub;
    //chatHub.connection.url = "http://localhost:29431/signalr";
    $.extend(chatHub.client, registerClientMethods(chatHub));
    // Need at least one callback for events to be raised on the hub
    chatHub.client.void = function () { };

    $.connection.hub.logging = true;

    // Start Hub

    $.connection.hub.start({ jsonp: true }).done(function () {

        chatHub.connection.qs = { "ConnectStatus": "Connected" };
        chatHub.server.connect(usrName, usrId).done(function () {
            console.log("ChatHub.Send completed successfully");
        }).fail(function (error) {
            console.log("ChatHub.Send failed:");
            console.log(error);
        });

        $("#HeadLoginView_LoginStatus2").click(function () {
            chatHub.server.onDisconnect();
        });
    });



}
function registerClientMethods(chatHub) {
    chatHub.client.acceptHubData = function (data) {
        console.log(data);
    }
    // Calls when user successfully logged in
    chatHub.client.onConnected = function (id, userName, allUsers, messages) {

        ConnectedUsers.push(id);

        $('#hdId').val(id);
        $('#hdUserName').val(userName);

        $('#divuserLists').empty();
        // Add All Users
        for (var i = 0; i < allUsers.length; i++) {


            AddUser(chatHub, allUsers[i].ConnectionId, allUsers[i].UserName, allUsers[i].usertype);

        }

        // Add Existing Messages
        for (var i = 0; i < messages.length; i++) {

            AddMessage(messages[i].UserName, messages[i].Message);
        }


    }
    chatHub.client.onCheckUsers = function (allUsers) {
        $('#divuserLists').empty();
        for (var i = 0; i < allUsers.length; i++) {


            AddUser(chatHub, allUsers[i].ConnectionId, allUsers[i].UserName);

        }
    }
    // On New User Connected
    chatHub.client.onNewUserConnected = function (id, name, allUsers) {
        $("#divuserLists").empty();
        for (i = 0; i < allUsers.length; i++) {
            AddUser(chatHub, allUsers[i].ConnectionId, allUsers[i].UserName, allUsers[i].usertype);
        }
    }


    // On User Disconnected
    chatHub.client.onUserDisconnected = function (id, userName) {

        $('#' + id).remove();

        var ctrId = 'private_' + id;
        $('#' + ctrId).remove();


        var disc = $('<div class="disconnect">"' + userName + '" logged off.</div>');

        $(disc).hide();
        $('#divuserLists').prepend(disc);
        $(disc).fadeIn(200).delay(2000).fadeOut(200);

    }

    chatHub.client.messageReceived = function (userName, message) {

        AddMessage(userName, message);
    }
    chatHub.client.LoadtoDisplay = function (messages, windowId) {
        //$('#private_' + windowId).find("#divMessage").html('');
        for (var i = 0; i < messages.length ; i++) {

            PreviousChatMessages(windowId, messages[i].UserName, messages[i].Message, messages[i].dt);
        }
    }

    chatHub.client.getPrivateMessage = function (windowId, fromUserName, message, id, updateddate) {
        if ($('#hdId').val() == id) {
            var ctrId = 'private_' + windowId;


            if ($('#' + ctrId).length == 0) {

                createPrivateChatWindow(chatHub, windowId, ctrId, fromUserName);

            }
            var classname = '';
            if ($('#hdUserName').val() == fromUserName) {
                classname = 'msgTextCurrentUser'
            } else {
                classname = 'msgTextnotCurrentUser'
            }
            $('#' + ctrId).find('#divMessage').append('<div class="message"><div class="' + classname + '"><span style="font-weight:bold;font-size: 8px;">' + updateddate + '</span><div>' + unescape(message) + '</div></div></div>');

            // set scrollbar
            var height = $('#' + ctrId).find('#divMessage')[0].scrollHeight;
            $('#' + ctrId).find('#divMessage').scrollTop(height);
        }
    }

    chatHub.client.sendPrivateMessage = function (windowId, fromUserName, message, updateddate) {

        var ctrId = 'private_' + windowId;


        if ($('#' + ctrId).length == 0) {

            createPrivateChatWindow(chatHub, windowId, ctrId, fromUserName);

        }
        var classname = '';
        if ($('#hdUserName').val() == fromUserName) {
            classname = 'msgTextCurrentUser'
        } else {
            classname = 'msgTextnotCurrentUser'
        }
        $('#' + ctrId).find('#divMessage').append('<div class="message"><div class="' + classname + '"><span style="font-weight:bold;font-size: 8px;">' + updateddate + '</span><div>' + unescape(message) + '</div></div></div>');

        // set scrollbar
        var height = $('#' + ctrId).find('#divMessage')[0].scrollHeight;
        $('#' + ctrId).find('#divMessage').scrollTop(height);

    }

}

function AddUser(chatHub, id, name) {

    var userId = $('#hdId').val();

    var code = "";

    if (userId == id) {

        //code = $('<div class="loginUser disabled">' + name + "</div>");

    }
    else {

        code = $("<a id='" + id + "' class='user' onclick ='clicktoChat(\"" + id + "\",\"" + name + "\")' >" + name + "<a>");
    }
    if (code != "") {
        $("#divuserLists").append(code);
    }


}
function clicktoChat(id, name) {
    OpenPrivateChatWindow(chatHub, id, name);
    chatHub.server.defaultLoadMessage(id);
}
function OpenPrivateChatWindow(chatHub, id, userName) {

    var ctrId = 'private_' + id;

    if ($('#' + ctrId).length > 0) return;

    createPrivateChatWindow(chatHub, id, ctrId, userName);

}

function createPrivateChatWindow(chatHub, userId, ctrId, userName) {

    var div = '<div id="' + ctrId + '" class="ui-widget-content draggable zVal" rel="0">' +
               '<div class="header">' +
                  '<div  style="float:right;">' +

                      '<svg id="imgDelete"  style="cursor:pointer;" viewBox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveAspectRatio="xMinYMin meet" class="artdeco-icon"><g class="small-icon" style="fill-opacity: 1"><path d="M13,4.32L9.31,8,13,11.69,11.69,13,8,9.31,4.31,13,3,11.69,6.69,8,3,4.31,4.31,3,8,6.69,11.68,3Z"></path></g></svg>' +
    '</div>' +

    '<span class="selText" rel="0">' + userName + '</span>' +
'</div>' +
'<div id="divMessage" class="messageArea">' +
'</div>' +
'<div class="buttonBar">' +
'<div class="load" style="padding-bottom:4px;"><a id="loadMsg" style="color:steelblue;cursor:pointer;width:500px;">Load previous messages...</a></div>';
    if (ChatFileTransfer == 'ON') {
        div += '<input type="file" id="FileUpload1" /> ';
    }

    div += '<input id="txtPrivateMessage" class="msgText" type="text"   />' +
              '<input id="btnSendMessage" class="submitButton button" type="button" value="Send"   />' +
           '</div>' +
        '</div>';

    var $div = $(div);

    // DELETE BUTTON IMAGE
    $div.find('#imgDelete').click(function () {
        $('#' + ctrId).remove();
        minloadMsgCount = 10;
        maxloadMsgCount = 0;
    });

    $div.find("#loadMsg").click(function () {
        maxloadMsgCount += 10;
        chatHub.server.loadMessage(userId, minloadMsgCount, maxloadMsgCount);
        minloadMsgCount = maxloadMsgCount;
    })
    // Send Button event
    $div.find("#btnSendMessage").click(function () {
        if (ChatFileTransfer == 'ON') {

            var fileUpload = $div.find("#FileUpload1").get(0);
            var files = fileUpload.files;
            if (files.length > 0) {
                var data = new FormData();
                for (var i = 0; i < files.length; i++) {
                    var d = new Date();
                    data.append(d.toISOString().replace(/[-:]/g, "") + files[i].name, files[i]);
                }

                $.ajax({
                    url: "../Fileupload.ashx",
                    type: "POST",
                    data: data,
                    contentType: false,
                    processData: false,
                    success: function (result) {
                        var $textBox = $div.find("#txtPrivateMessage");
                        var msg = $textBox.val();
                        msg += ' <a style="width:180px;" title="' + result + '" onclick=fndownload("' + result + '")>' + result + '</a>';
                        if (msg.length > 0) {

                            chatHub.server.sendPrivateMessage(userId, escape(msg));
                            $textBox.val('');
                        }
                        $div.find("#FileUpload1").val("");
                    },
                    error: function (err) {
                        alert(err.statusText)
                    }
                });
            }
            else {
                var $textBox = $div.find("#txtPrivateMessage");
                var msg = $textBox.val();
                if (msg.length > 0) {

                    chatHub.server.sendPrivateMessage(userId, msg);
                    $textBox.val('');
                }
            }
        } else {
            var $textBox = $div.find("#txtPrivateMessage");
            var msg = $textBox.val();
            if (msg.length > 0) {

                chatHub.server.sendPrivateMessage(userId, msg);
                $textBox.val('');
            }
        }


    });

    // Text Box event
    $div.find("#txtPrivateMessage").keypress(function (e) {
        if (e.which == 13) {
            $div.find("#btnSendMessage").click();
            return false;
        }
    });

    AddDivToContainer($div);

}

function AddDivToContainer($div) {
    $('#divContainerChat').prepend($div);

    $div.draggable({

        handle: ".header",
        stop: function () {

        }
    });


}

function fndownload(filename) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.open('../uploads/' + filename, filename);
    } else {
        var link = document.createElement("a");
        link.download = name;
        link.href = '../uploads/' + filename;
        link.download = filename;
        link.click();
        setTimeout(function () {
            $(link).remove();
        }, 1000);
    }

}
function PreviousChatMessages(windowId, userName, message, updateddate) {
    var classname = '';
    if ($('#hdUserName').val() == userName) {
        classname = 'msgTextCurrentUser'
    } else {
        classname = 'msgTextnotCurrentUser'
    }
    $('#private_' + windowId).find("#divMessage").prepend('<div class="message"><div class="' + classname + '"><span style="font-weight:bold;font-size: 8px;">' + updateddate + '</span><div>' + unescape(message) + '</div></div></div>');
}
function AddMessage(userName, message) {
    var classname = '';
    if ($('#hdUserName').val() == userName) {
        classname = 'msgTextCurrentUser'
    } else {
        classname = 'msgTextnotCurrentUser'
    }
    $('#divChatWindow').append('<div class="message"><div class="' + classname + '">' + unescape(message) + '</div></div>');

    var height = $('#divChatWindow')[0].scrollHeight;
    $('#divChatWindow').scrollTop(height);
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function initialMaster() {

    $(".anchor").each(function () {
        var el = $(this);
        el.click(function (e) {
            if (el.parent('li').hasClass('sf-parent')) {
                e.preventDefault();
            } else {
                var txt = 'MENU-' + el.data('url')
                setTimeout(function () { __doPostBack('up2', txt); }, 500);
                e.preventDefault();
            }
        });
    })
    $('ul.sf-menu').sooperfish({
        dualColumn: 14, //if a submenu has at least this many items it will be divided in 2 columns
        tripleColumn: 20, //if a submenu has at least this many items it will be divided in 3 columns
        hoverClass: 'sfHover',
        delay: 300, //make sure menus only disappear when intended, 500ms is advised by Jacob Nielsen
        animationShow: { width: 'show', height: 'show', opacity: 'show' },
        speedShow: 100,
        easingShow: 'easeOutBounce',
        animationHide: { width: 'hide', height: 'hide', opacity: 'hide' },
        speedHide: 100,
        easingHide: 'easeInOvershoot',
        autoArrows: true
    });

    $('#dv_Logout').dialog({
        autoOpen: false,
        draggable: false,
        resizable: false,
        modal: false,
        open: function (type, data) {
            $(this).parent().appendTo("form");
        },
        close: function (type, data) {
            //document.getElementById("btn_FeatureSelect").click();
        },
        show: {
            effect: "puff",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    });

    $("[id*=dl_Menus] tr").each(function () {
        $(this).css("border-bottom", "1px solid #254462");
    });
}

function fnMasterRight() {
    var curURL = window.location.href;
    if (curURL.toUpperCase().indexOf("COURSE_CATELOG.ASPX") > -1)
        return true;
    else
        return false;
}

function fnLogOut() {

    try { flashDataUpdation('LOGOUT.WINDOW', 'END'); } catch (e) { }

    $('#btn_Logout').click();
}

function fnLoad() {
    //if(history.length>0) history.go(+1);
    //window.history.forward();
    settime();
}
//fnLoad();
//window.onload = fnLoad();
//window.onpageshow = function (evt) { if (evt.persisted) fnLoad(); }
window.onunload = function () { void (0); }

$(window).bind('beforeunload', function () {
    var evtobj = window.event ? event : e

    var winWidth = $(window).width() - evtobj.clientX;
    var winHeight = $(window).height();

    try { flashDataUpdation('LOGOUT.WINDOW', 'END'); } catch (e) { }

    //var sessionState=callJson();

    //if ((evtobj.clientX < 0) && (evtobj.clientY < 0)) {
    //if ((winWidth <= 36) && (evtobj.clientY < 0) && (window.name.toUpperCase() != "DASHBOARD") && (sessionState=="True")) {
    if ((winWidth <= 46) && (evtobj.clientY < 0) && (window.name.toUpperCase() != "DASHBOARD")) {
        var returnCode = logOff_Event();
        alert(logout_message);
        //alert(returnCode);
    }
});

function logOff_Event() {
    var evtobj = window.event ? event : e

    var winWidth = $(window).width() - evtobj.clientX;
    var winHeight = $(window).height();

    //debugger;
    //if ((evtobj.clientX < 0) && (evtobj.clientY < 0)) {
    if ((winWidth <= 36) && (evtobj.clientY < 0)) {
        var userID = document.getElementById('hid_Master_UserID').value;
        var courseID = document.getElementById('hid_Master_CourseID').value;
        var elementID = document.getElementById('hid_Master_Menu_CourseID').value;
        var AtdID = document.getElementById('hid_Master_AttendenceID').value;

        //alert(userID + "===" + courseID + "==" + elementID + "===" + AtdID);

        //var webUrl = '../Account/Logoff.aspx';
        var currHost = window.location.href;
        webUrl = currHost.substring(0, currHost.indexOf('/', 8)) + webUrl;
        //alert(webUrl);
        var queryString = '?LogoffDatabase=Y&UserID=' + userID + '&CourseID=' + courseID + '&AtdID=' + AtdID + '&ElementID=' + elementID;
        var returnCode = callAjax(webUrl, queryString);
        return returnCode;
    }
}

function callJson() {
    $.ajax({
        type: "POST",
        url: "../course/TakeCourse_DB.aspx/GetSession",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            //alert(result.d);
            return result.d;
        },
        error: function (result) {
            //alert(result.d);
        }
    });
}

function callAjax(webUrl, queryString) {
    var xmlHttpObject = null;

    try {
        // Firefox, Opera 8.0+, Safari...
        xmlHttpObject = new XMLHttpRequest();
    }
    catch (ex) {
        // Internet Explorer...
        try {
            xmlHttpObject = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (ex) {
            xmlHttpObject = new ActiveXObject('Microsoft.XMLHTTP');
        }
    }

    if (xmlHttpObject == null) {
        window.alert('AJAX is not available in this browser');
        return;
    }

    xmlHttpObject.open("GET", webUrl + queryString, false);
    xmlHttpObject.send();

    return xmlHttpObject.responseText;
}

setInterval("settime()", 1000);

function settime() {
    var dateTime = new Date();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();

    if (hour < 10) hour = "0" + hour;
    if (minute < 10) minute = "0" + minute;
    if (second < 10) second = "0" + second;

    var time = "" + hour + ":" + minute + ":" + second;
    if (document.getElementById("sp_AppTime") != null) {
        document.getElementById("sp_AppTime").innerText = time;

    }
}

function fnMenuStyle(ctrl) {
    //debugger;
}

//        function fnMoveTime(moveType) {
//            setInterval("fnTopMenuMove('" + moveType + "')", 500);
//        }

function fnTopMenuMove(moveType, selectedNo, focusID) {
    //debugger;
    if (document.getElementById("td_MenuBack") == null) return false;

    var cel_Display = 9;
    var len_MoveCell = 125;
    var cel_Total = document.getElementById("hid_MenuCount").value;  //document.getElementById("dl_Menu").cells.length;

    if (cel_Display <= cel_Total) {
        //document.getElementById("btn_MenuBack").style.display = "block";
        //document.getElementById("btn_MenuForward").style.display = "block";

        document.getElementById("td_MenuBack").style.display = "block";
        document.getElementById("td_MenuForward").style.display = "block";
    }
    else {
        //document.getElementById("btn_MenuBack").style.display = "none";
        //document.getElementById("btn_MenuForward").style.display = "none";

        document.getElementById("td_MenuBack").style.display = "none";
        document.getElementById("td_MenuForward").style.display = "none";
    }

    var currPos = document.getElementById("dv_Menu").scrollLeft;
    var LastPos = (parseFloat(cel_Total) - cel_Display) * len_MoveCell;

    if (moveType == "Back") {
        currPos = parseFloat(currPos) - len_MoveCell
        //if (currPos <= 0) document.getElementById("btn_MenuBack").style.display = "none";
        if (currPos <= 0) document.getElementById("td_MenuBack").style.display = "none";
    }
    else if (moveType == "Forward") {
        currPos = parseFloat(currPos) + len_MoveCell
        //if (currPos >= LastPos) document.getElementById("btn_MenuForward").style.display = "none";

        if (currPos >= LastPos) document.getElementById("td_MenuForward").style.display = "none";
    }
    else if (moveType == "Select") {
        if (cel_Display < selectedNo)
            currPos = parseFloat(currPos) + ((parseFloat(selectedNo) - parseFloat(cel_Display)) * len_MoveCell);
        else
            currPos = 0; //  parseFloat(currPos) + len_MoveCell;

        //if (currPos <= 0) document.getElementById("btn_MenuBack").style.display = "none";
        //if (currPos >= LastPos) document.getElementById("btn_MenuForward").style.display = "none";

        if (currPos <= 0) document.getElementById("td_MenuBack").style.display = "none";
        if (currPos >= LastPos) document.getElementById("td_MenuForward").style.display = "none";

        document.getElementById(focusID).focus();
    }
    //alert(currPos + "==" + LastPos);
    document.getElementById("dv_Menu").scrollLeft = currPos;

}

function closeme() {
    //            document.getElementById("btn_OverAll_close").click();
    //            window.open('', '_self', '');
    //            window.close();
}

var windowObjectReference = null;
function showPopup(val) {
    if (windowObjectReference == null || windowObjectReference.closed) {
        var path = location.pathname;
        var p = location.pathname.split("/");

        //windowObjectReference = window.open("/" + p[1] + "/AppAdmin/UserManual.aspx", "", "width=750px,height=700px,resizable=no,scrollbars=yes,status=yes");
        windowObjectReference = window.open(helpUrl, "", "width=750px,height=700px,resizable=no,scrollbars=yes,status=yes");
    }
    else {
        windowObjectReference.focus();
    };
}

function Left_MenuSelect(ctrl, imgIcon) {
    $("#" + ctrl).parent().css("background-image", imgIcon);//"../App_Themes/" & cls_Session.LMS_Themes & "/Images/MenuIcons/" & imgIcon & "_normal.png");
}