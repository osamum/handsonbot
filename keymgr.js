const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const dotenv = require('dotenv');
dotenv.config();
// Key Vault のエンドポイント（Azure ポータルの「コンテナーの URI」）
const keyVaultUrl = process.env['KEY_VAULT_ENDPOINT'];
const llmSecretName = process.env['KEY_VAULT_SECRET_LLM'];
const SearchSecretName = process.env['KEY_VAULT_SECRET_SEARCH'];

// 認証情報を取得（Azure CLI ログイン済み、またはマネージド ID を使用）
const credential = new DefaultAzureCredential();

// シークレットクライアントを作成
const client = new SecretClient(keyVaultUrl, credential);

// シークレット名を指定して取得
async function getSecret(secretName) {
    try {
        const secret = await client.getSecret(secretName);
        console.log(`Read secret:${secretName} from KeyVault`);
        return secret.value;
    } catch (err) {
        console.error(`Can't read secret:${secretName} from KeyVault. Reason : ${err.message}`);
        return null;
    }
}

async function setSecretEnv() {
    process.env.AZURE_OPENAI_API_KEY = await getSecret(llmSecretName);
    process.env.SEARCH_API_KEY = await getSecret(SearchSecretName);
}

//他のファイルから呼び出せるようにエクスポート
module.exports = { setSecretEnv };


//Key Vault からシークレットを取得して環境変数に設定したのを確認するテストコード
/*
setSecretEnv().then(() => {
    console.log('AZURE_OPENAI_API_KEY:' + process.env.AZURE_OPENAI_API_KEY);
    console.log('SEARCH_API_KEY:' + process.env.SEARCH_API_KEY);
}).catch(err => {
    console.error("Error setting environment variables from Key Vault:", err);
});
*/