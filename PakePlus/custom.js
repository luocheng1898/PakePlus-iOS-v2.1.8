window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })
// ==================== 以下是新增的Cordys CRM通知脚本 ====================
// Cordys CRM 通知推送脚本（适配PakePlus原生通知）
(function() {
    // 避免重复执行
    if (window.cordysNotificationInjected) return;
    window.cordysNotificationInjected = true;

    // 配置项：可根据实际页面调整选择器
    const CONFIG = {
        // Cordys CRM常见的通知角标选择器（优先尝试）
        notificationSelectors: [
            '.notification-badge', // 通知角标
            '.todo-count',          // 待办数量
            '.unread-alerts',       // 未读提醒
            '#alert-count',         // 提醒计数
            '.cordys-notification .count' // Cordys官方类名
        ],
        checkInterval: 60000, // 每分钟检查一次通知
        notificationTitle: 'Cordys CRM 提醒', // 通知标题
        icon: 'https://crm.fooae.com/favicon.ico' // 通知图标（自动适配你的CRM）
    };

    // 查找通知数量的核心函数
    function getNotificationCount() {
        for (const selector of CONFIG.notificationSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                // 提取数字（如"5条"→5，"9+"→9）
                const countText = element.textContent.trim();
                const count = parseInt(countText.replace(/[^0-9]/g, ''), 10);
                return isNaN(count) ? 0 : count;
            }
        }
        return 0;
    }

    // 发送原生通知
    function sendNativeNotification(count) {
        // 仅当有新通知时发送
        if (count <= 0) return;
        
        // 调用PakePlus的原生通知API（安卓/iOS通用）
        if (window.pake?.notification?.send) {
            window.pake.notification.send({
                title: CONFIG.notificationTitle,
                body: `你有${count}条未处理的待办/审批提醒，请及时处理`,
                icon: CONFIG.icon,
                // 点击通知跳转到通知列表（适配Cordys CRM常见路径）
                onClick: () => {
                    // 如需调整跳转路径，修改这里即可
                    window.location.href = '/cordys/notification/list';
                }
            });
        }
    }

    // 初始化：首次加载检查一次
    let lastCount = getNotificationCount();
    sendNativeNotification(lastCount);

    // 定时检查：仅当通知数量增加时发送（避免重复推送）
    setInterval(() => {
        const currentCount = getNotificationCount();
        if (currentCount > lastCount) {
            sendNativeNotification(currentCount);
        }
        lastCount = currentCount;
    }, CONFIG.checkInterval);

    // 可选：监听页面切换，实时更新通知
    document.addEventListener('DOMContentLoaded', () => {
        lastCount = getNotificationCount();
    });
})();