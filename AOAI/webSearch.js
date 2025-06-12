//const errorHandler = require('error-handle.js');
const {isWithinTokenLimit, countTokens } = require('gpt-tokenizer/model/gpt-4o');
const dotenv = require('dotenv');
dotenv.config();

const web_search_endpoint  = process.env['WEB_SEARCH_ENDPOINT'];
const web_search_key = process.env['WEB_SEARCH_KEY'];
const isAvailable = web_search_endpoint && web_search_key ? true : false;

async function webSearch(query) {
    /*
    GitHub Copilot や他の生成 AI サービスを使用し、以下のプロンプトでこの関数のコードを生成してください
    -----
    webSearch という名前で、引数 query で受け取った文字列を (※API を提供している任意の検索サービス) API で検索し、検索結果の url を配列で返す関数を JavaScript で作成してください。
    ・取得する結果の個数は 3 件にしてください
    ・HTTP のリクエストには fetch を使用してください
    */
}


//url に指定された Web ページの body タグの内容だけを取得して返り値として返す
async function getBodyContent(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const text = await response.text();
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : null;
}

// 指定された HTML タグで囲まれた文字列を削除する
function rmTagRange(content, htmlTag) {
    const regex = new RegExp(`<${htmlTag}[^>]*>(.*?)<\/${htmlTag}>`, 'gs');
    return content.replace(regex, '');
}

// すべてのコメントを削除する
function rmCommentTag(content) {
    return content.replace(/<!--.*?-->/g, '').trim();
}

// ドキュメントの構造に影響を与えない属性を削除する
function sharpenTags(content) {
    return content.replace(/\s*(id|style|class|tabindex|width|height|target|data-m)="[^"]*"/g, '');
}

//言語モデルが回答を生成するためのプロンプト
async function createRequestWithWebSearchResult(userString, query) {
    const webSerchResult = JSON.stringify(await getWebSearchResult(query));
    return `[question] の内容に対し[content]内のJSONの内容を使用して回答してください\n` +
        `・ 各要素の url のドメイン名からも信頼性を判断してください\n` +
        `・ 各要素の content 内の HTML タグの構造も参考にしてください\n` +
        `・ 自身の回答に不必要に重複する文章がないようにしてください\n` +
        `・ [question]に対し[content]の内容に回答としてふさわしい情報かないと判断した場合にはその旨を回答してください\n` +
        `[question]\n${userString}\n\n[content]\n${webSerchResult}`
}

function rmEmptyTagRange(content, htmlTag) {
    // 正規表現を使って、指定されたHTMLタグが空のケースをチェックし、除去する
    let regex = new RegExp(`<${htmlTag}[^>]*>\\s*<\/${htmlTag}>`, 'gi');
    return content.replace(regex, '');
}

//言語モデルが回答を生成するための情報を生成
async function getWebSearchResult(query) {
// Web の検索結果を取得
    const urlList = (await webSearch(query));
    const resultList = [];
    for (const url of urlList) {
        const result = {};
        result.url = url;
        //Web ページの内容を取得
        const bodyContent = await getBodyContent(url);
        //コメントの削除
        let rmed_content = rmComment(bodyContent);　
        //不要なタグの削除
        rmed_content = rmTagRange(rmed_content, 'style');
        rmed_content = rmTagRange(rmed_content, 'script');
        rmed_content = rmTagRange(rmed_content, 'iframe');
        rmed_content = rmTagRange(rmed_content, 'area');
        rmed_content = rmTagRange(rmed_content, 'map');
        //空の div タグの削除
        rmed_content = rmed_content.replace(/<div><\/div>/g, '');
        //改行、タブの削除
        rmed_content = rmed_content.replace(/[\r\n\t]/g, '');
        //不要な属性の削除
        result.content = sharpenTags(rmed_content);
        resultList.push(result);
    }
    return resultList;
}

module.exports = {
    createRequestWithWebSearchResult,
    isAvailable
};