
const $id = (id)=> document.getElementById(id);
const ctlr_inputText = $id('inputText');
const ctlr_convLog = $id('convLog');
const ctrl_status = $id('status');
ctlr_inputText.focus();


document.getElementById('post').addEventListener('click', async () => {
    const inputText = ctlr_inputText.value;
    if (inputText) {
        addConvLog(`🧑‍💻 : ${inputText}`);
        visibleStatus(true);
        // メッセージを送信
        const responseMessage = await postMessage(inputText);
        visibleStatus(false);
        // レスポンスを表示
        addConvLog(`🤖 : ${responseMessage}`);
        // 入力フィールドをクリア
        ctlr_inputText.value = '';
    } else {
        alert('メッセージを入力してください');
    }
});

async function postMessage(message) {
    // テストデータ
    const messageBody = {
        message: message
    };
    try {
        const response = await fetch('/postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageBody)
        });

        // レスポンスの確認
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.message; 
    } catch (error) {
        // エラーメッセージを出力
        console.error('Error occurred:', error.message);
    }
}

function addConvLog(message) {
   const msgDiv = document.createElement('div');
   msgDiv.innerHTML = mkdn2html(message);
   if(ctlr_convLog.firstChild) {
    const lineBreak = document.createElement('br');
    ctlr_convLog.prepend(lineBreak); 
    ctlr_convLog.prepend(msgDiv); // 新しいメッセージを最上部に追加
   }else{
    ctlr_convLog.appendChild(msgDiv); // 最初のメッセージは通常通り追加
   }
}

function visibleStatus(flg){
    ctrl_status.style.display = flg ? 'block' : 'none';
}

function mkdn2html(markdown) {
  // 画像: ![alt](url)
  markdown = markdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // 見出し (例: ### Heading)
  markdown = markdown.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  markdown = markdown.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  markdown = markdown.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 太字: **text** または __text__
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  markdown = markdown.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // イタリック: *text* または _text_
  markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
  markdown = markdown.replace(/_(.*?)_/g, '<em>$1</em>');

  // リンク: [text](url)
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 改行を <br> に変換（段落内での改行対策）
  markdown = markdown.replace(/\n/g, '<br>');

  return markdown;
}

  

  
  

