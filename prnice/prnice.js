"use strict";

function main() {
	console.log('Start prnice.....');

    let activityBlock = getActivityBlock();
	let target = getContentPanel();
	target.insertBefore(activityBlock, target.firstChild);
	target.setAttribute('style', 'display: inline-block;');

	let activities = extractActivities(activityBlock);
	insertToc(target, activities);
}

function getActivityBlock() {
    return document.getElementsByClassName('pull-request-activity-content')[0];
}

function getContentPanel() {
    return document.getElementsByClassName('aui-group')[0];
}

function extractActivities(activityBlock) {
    let result = new Array();
    for (const activityElem of activityBlock.children[0].children) {
        console.log(activityElem);
        if (activityElem.className.indexOf('comment-activity') > -1) {
            let activity = mapActivity(activityElem);
            result.push(activity);
            enrichActivity(activityElem, activity.id);
        }
    }
    return result;
}

function mapActivity(activityElem) {
    return {
               "id": extractId(activityElem),
               "author": extractAuthor(activityElem),
               "localFileName": extractLocalFileName(activityElem),
               "summary": extractSummary(activityElem),
               "elem": activityElem
           };
}

function enrichActivity(activityElem, id) {
    activityElem.id = 'plugin_' + id;
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'activityCheckbox_' + id;
    checkbox.setAttribute('onchange', "activityCheckHandler(this, '" + id + "');");

    let summary = null;
    let classNames = activityElem.className;
    if (classNames.indexOf('general-comment-activity') > -1) {
        let contentElem = activityElem.children[1];
        summary = contentElem.children[0];
    } else if (classNames.indexOf('diff-comment-activity') > -1) {
        let actionElem = activityElem.children[0].children[1];
        summary = actionElem.children[0];
    } else if (classNames.indexOf('file-comment-activity') > -1) {
        let activityItemElem = activityElem.children[1];
        let actionElem = activityItemElem.children[1];
        summary = actionElem.children[0];
    } else {
        alert('Unknown comment activity:' + classNames);
        return null;
    }
    summary.insertBefore(checkbox, summary.firstChild);
}

function extractId(activityElem) {
    let result = activityElem.getAttribute('data-activityid');
    if (!result) {
        result = activityElem.getAttribute('data-id');
    }
    return result;
}

function extractAuthor(activityElem) {
    let classNames = activityElem.className;
    if (classNames.indexOf('general-comment-activity') > -1) {
        let contentElem = activityElem.children[1];
        return contentElem.children[0].innerHTML;
    } else if (classNames.indexOf('diff-comment-activity') > -1) {
        let actionElem = activityElem.children[0].children[1];
        let summaryElem = actionElem.children[0];
        return summaryElem.children[0].innerHTML;
    } else if (classNames.indexOf('file-comment-activity') > -1) {
        let activityItemElem = activityElem.children[1];
        let actionElem = activityItemElem.children[1];
        let summaryElem = actionElem.children[0];
        return summaryElem.children[0].innerHTML;
    } else {
        alert('Unknown comment activity:' + classNames);
        return null;
    }
}

function extractLocalFileName(activityElem) {
    let classNames = activityElem.className;
    if (classNames.indexOf('general-comment-activity') > -1) {
        return 'General comment';
    } else if (classNames.indexOf('diff-comment-activity') > -1) {
        let actionElem = activityElem.children[0].children[1];
        let detailElem = actionElem.children[1];
        let fileContentElem = detailElem.children[0];
        let fileToolbarElem = fileContentElem.children[0];
        let primaryElem = fileToolbarElem.children[1];
        let breadcrumbsElem = primaryElem.children[1];
        let localNameElem = breadcrumbsElem.children[2];
        return localNameElem.innerHTML;
    } else if (classNames.indexOf('file-comment-activity') > -1) {
        let activityItemElem = activityElem.children[1];
        let actionElem = activityItemElem.children[1];
        let detailElem = actionElem.children[1];
        let fileContentElem = detailElem.children[0];
        let fileToolbarElem = fileContentElem.children[0];
        let primaryElem = fileToolbarElem.children[1];
        let breadcrumbsElem = primaryElem.children[1];
        let localNameElem = breadcrumbsElem.children[2];
        return localNameElem.innerHTML;
    } else {
        alert('Unknown comment activity:' + classNames);
        return null;
    }
}

function extractSummary(activityElem) {
    let ch1 = activityElem.children[0].children[1];
    if (ch1) {
        return ch1.children[0].innerHTML;
    } else {
        return 'General/file comment';
    }
}

function insertToc(parent, activities) {
    let main = document.createElement('div');
    let ol = document.createElement('ol');
    activities.forEach(a => {
        let li = document.createElement('li');
        li.innerHTML = '<a href="#plugin_' + a.id + '">[jump]</a>'
            + ' ' + '<input type="checkbox" id="chk_' + a.id + '"'
            + ' onchange="activityCheckHandler(this, \'' + a.id + '\');"'
            + '>'
            + ' ' + a.author
            + ' - ' + '<span style="font-weight: bold;">' +  a.localFileName + '</span>'
            ;
        ol.appendChild(li);
    });
    main.appendChild(ol);
    parent.insertBefore(main, parent.firstChild);
}

function activityCheckHandler(me, id) {
    if (me.id.startsWith('activityCheckbox_')) {
        let otherChk = document.getElementById('chk_' + id);
        otherChk.checked = me.checked;
    }
    if (me.id.startsWith('chk_')) {
        let otherChk = document.getElementById('activityCheckbox_' + id);
        otherChk.checked = me.checked;
    }
}

window.activityCheckHandler = activityCheckHandler;

main();