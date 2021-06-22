// ==UserScript==
// @name         Pressball comments
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.pressball.by/*
// @grant GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let globals = {
        "forumLink": null
    };

    let renderCommentsSection = (responseDetails) => {
        disableLoading();
        let commentsPage = document.createElement('html');
        commentsPage.innerHTML = responseDetails.responseText;
        let commentsPanel = commentsPage.querySelector('#qr_posts')
        let endOfNewsText = document.querySelector('.comment_list');
        let commentList = Array.from(commentsPanel.querySelectorAll('.post')).map(postElement => {
            return {
                'author': postElement.querySelector('.username').text,
                'date': postElement.querySelector('.post .author').childNodes[4].textContent.trim(),
                'content': postElement.querySelector('.content').innerHTML
            }
        }).map(comment => {
            let commentString = JSON.stringify(comment);
            let commentElement = document.createElement('div')
            commentElement.innerHTML = commentString;
            return getCommentNode(comment);
        }).forEach(element => {
            endOfNewsText.appendChild(element);
        });
    };

    let getCommentNode = comment => {
        let commentHtml = `
            <div class="item comment">
	            <div class="name"><span>${comment.author}</span> ${comment.date}</div>
	            <div>${fixQuoteStyle(comment.content)}</div>
            </div>`;
        let commentNone = document.createElement('div')
        commentNone.innerHTML = commentHtml;
        return commentNone;
    };

    let fixQuoteStyle = commentText => {
        return commentText
            .replaceAll('<cite', '<div')
            .replaceAll('<blockquote>', '<blockquote class="quote">')
            .replaceAll('↑', '');
    };

    let buildCommentLink = link => {
        return link + "&f=22";
    };

    let loadComments = forumLink => {
        GM_xmlhttpRequest ( {
            method: 'POST',
            url: forumLink,
            onload: renderCommentsSection,
            data: "st=0&sk=t&sd=d&sort=%D0%9F%D0%B5%D1%80%D0%B5%D0%B9%D1%82%D0%B8",
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "ru-RU,ru;q=0.9,en-DE;q=0.8,en;q=0.7,en-US;q=0.6",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            }
        } );
    };

    let createUpdateCommentsButton = () => {
        let htmlText = '<div><a class="btn2"><span class="btn2_r"><span>Обновить</span>Обновить</span></a></div>';
        let node = document.createElement('div');
        node.innerHTML = htmlText;
        return node;
    };

    let createSkeletonItem = () => {
        let htmlText = '<div></div>';
        let node = document.createElement('div');
        node.innerHTML = htmlText;
        node.style.cssText = 'height: 100px;display:block;box-shadow: 0 10px 45px rgba(0,0,0, .05);margin: 15px 0;'
        return node;
    };

    let setLoading = () => {
        let numberOfLoadedComments = document.querySelectorAll('.comment').length || 5;
        let endOfNewsText = document.querySelector('.comment_list');
        endOfNewsText.innerHTML = '';
        for (let i = 0; i < numberOfLoadedComments; i++) {
            endOfNewsText.appendChild(createSkeletonItem());
        }
    };

    let disableLoading = () => {
        let endOfNewsText = document.querySelector('.comment_list');
        endOfNewsText.innerHTML = '';
    };

    let commentsElement = document.querySelector(".dobav_comm a");
    if (!commentsElement) {
        return;
    }
    let commentLink = commentsElement.getAttribute("href");

    let addCommentButton = document.querySelector('.dobav_comm');
    let updateCommentsButton = createUpdateCommentsButton();
    updateCommentsButton.onclick = () => { setLoading();loadComments(globals.forumLink);};
    addCommentButton.parentNode.appendChild(updateCommentsButton);
    setLoading();

    GM_xmlhttpRequest ( {
        method: 'GET',
        url: commentLink,
        onload: response => {
            let forumLink = buildCommentLink(response.finalUrl);
            globals.forumLink = forumLink;
            loadComments(forumLink);
        },
    } );
})();
