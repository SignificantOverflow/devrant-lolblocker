// ==UserScript==
// @name         devRant Lolblocker
// @namespace    https://devrant.com
// @version      0.1
// @description  Eradicate those pesky lols in the comments
// @author       SignificantOverflow
// @match        https://devrant.com/rants/*
// @grant        none
// ==/UserScript==

// CONFIG
var minimal_lols = true; // otherwise fully exterminate
var spared_lols = 2; // allow lols if their count doesn't exceed X
var display_stats = true; // display stats in original rant

(function() {
    'use strict';

    var getStats = function(offenders, blocked_counter) {
        var stats = `
            <li class="reply-row rant-comment-row-widget" data-type="blockstat">
                <div class="rantlist-content-col">
		    	    <div class="username-row">
		    			<a href="localhost" class="user-info">
		    				<div class="user-info-text">
		    					<span class="user-name">Blocked LOLs</span>
		    					<span class="user-extras"><div class="user-score"><span>`+blocked_counter+`</span></div></span>
		    				</div>
		    			</a>
		    		</div>
                    <div class="rantlist-title">
        `
        for (var key of offenders.keys()) {
            stats += "<a href=\"/users/"+key+"\">";
            stats += "<div title=\""+key+": " + offenders.get(key).count + "\" class=\"user-circle\" style=\"display:inline-block; background-color: "
                  + offenders.get(key).bg+"; width: 30px; height: 30px;\">";
            stats += "<img src=\""+offenders.get(key).avatar+"\" /></div></a>";
        }
        stats += "</div></li>";
        return stats;
    }

    var hasContent = function(comment){
        if (comment.getElementsByClassName("rant-image").length != 0) return 1;
        var content = comment.getElementsByClassName('rantlist-title')[0].innerHTML;
        content = content.replace(/<a href="\/users\/[0-9a-zA-Z_\-]+" style="color: #54556e;">(@[0-9a-zA-Z_\-]+)?<\/a>/g, '');
        content = content.replace(/<br>/g, '');
        content = content.replace(/[^a-zA-Z]/g, '');
        if (content == '') return 1; // mentions etc.
        content = content.replace(/(l[oe]l)+/gi, '');
        return (content == '' ? 0 : 1);
    };

    var blocked_counter = 0;
    var offenders = new Map();
    var comments = document.getElementsByClassName('rant-comment-row-widget');
    for (var i = 0; i < comments.length; i++) {
        if (hasContent(comments[i]) == 0) {
            var name = comments[i].getElementsByClassName('user-name')[0].innerHTML;
            var counter = 1;
            var avatarImg = comments[i].getElementsByTagName("img");
            avatarImg = (avatarImg.length > 0 ? avatarImg[0].src : "");
            var avatarBg = comments[i].getElementsByClassName('user-circle')[0].style.backgroundColor;
            if (offenders.has(name)) {
                counter = offenders.get(name).count + 1;
            }
            offenders.set(name, {count:counter, avatar:avatarImg, bg:avatarBg});
            comments[i].parentElement.removeChild(comments[i]); i--;
            blocked_counter++;
        }
    }

    if (display_stats && blocked_counter > /*spared_lols*/0) {
        var rant = document.getElementsByClassName('rantlist')[0];
        rant.innerHTML = getStats(offenders, blocked_counter) + rant.innerHTML;
    }
})();
