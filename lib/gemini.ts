import { GoogleGenerativeAI } from "@google/generative-ai";

// .env からAPIキーを読み込む
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API Key is missing! Check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// モデルの指定（Gemini 1.5 Flash は高速で安価）
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * クエストの「音声報告」を鑑定する関数
 * @param base64Audio 音声データ（Base64形式）
 * @param questTitle クエストの名前（例：宿題）
 * @returns 鑑定結果 { transcript, rank, comment }
 */
export async function analyzeVoiceReport(base64Audio: string, questTitle: string) {
  try {
    // AIへの命令文（プロンプト）
    const prompt = `
      あなたは子供の冒険を評価する「ギルドの賢者」です。
      子供が「${questTitle}」というクエスト（お手伝いや宿題）について、音声で報告をしてきました。
      
      音声を聞き取り、以下の処理を行ってください。
      1. 子供が何を言ったか文字起こしをする（transcript）。
      2. 内容を評価し、ランク（S/A/B/C）をつける。
      3. 子供に向けた50文字以内の褒め言葉（comment）を作る。勇者らしいRPG風の口調で。

      必ず以下のJSON形式のみを返してください。Markdownの記号は不要です。
      {
        "transcript": "ここに文字起こし",
        "rank": "S",
        "comment": "ここに褒め言葉"
      }
    `;

    // 音声データをGeminiへ渡す形式
    const audioPart = {
      inlineData: {
        data: base64Audio,
        mimeType: "audio/mp4", // expo-avの録音データ形式に合わせる
      },
    };

    // AIに送信！
    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const text = response.text();

    // JSON部分だけを取り出してパースする（エラー回避用）
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("AI音声鑑定エラー:", error);
    // エラー時はデフォルトの値を返す
    return { 
      transcript: "（音声の解析に失敗しました）",
      rank: "C", 
      comment: "むむ、通信のノイズでよく聞こえなかったぞ。もう一度報告してくれ！" 
    };
  }
}