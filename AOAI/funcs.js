function getCurrentDatetime() {
    const now = new Date();

    // 年・月・日・時間・分・秒を取得
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 曜日を取得
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = weekdays[now.getDay()];

    // フォーマットを整えて返す
    return `${year}/${month}/${date} ${hours}:${minutes}:${seconds} (${dayOfWeek})`;
}

async function callApi(url) {
    try {
        const response = await fetch(url);

        // レスポンスが成功したかをチェック
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // レスポンスを JSON 形式で返す
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // エラーを再スローします（必要に応じて処理してください）
    }
}

async function getGitHubUserinfo(userName) {
    const url = `https://api.github.com/users/${userName}`;

    try {
        const userInfo = await callApi(url);
        return userInfo;
    } catch (error) {
        console.error('Failed to fetch GitHub user info:', error);
        throw error; // エラーを再スローします（必要に応じて処理してください）
    }
}

module.exports = {getCurrentDatetime,getGitHubUserinfo};