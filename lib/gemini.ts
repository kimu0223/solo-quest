import { GoogleGenerativeAI } from "@google/generative-ai";

// .env からAPIキーを読み込む
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API Key is missing! Check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// モデルの指定
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * クエストの「音声報告」を鑑定する関数
 * @param base64Audio 音声データ（Base64形式）
 * @param questTitle クエストの名前
 * @param isRetry これが「聞き直し（2回目以降）」かどうか
 * @returns 鑑定結果 { transcript, rank, comment, xp_bonus }
 */
export async function analyzeVoiceReport(
  base64Audio: string, 
  questTitle: string, 
  isRetry: boolean = false // ★追加: リトライフラグ
) {
  try {
    // ★追加: 聞こえなかった場合の指示を動的に変える
    const inaudibleInstruction = isRetry
      ? `- 2回目の報告も聞き取れない場合: rankを "C" にし、commentは "むむ、やはりノイズでよく聞こえぬ…。今回はCランクとして記録しておこう。" としてください。`
      : `- 音声が聞き取れない場合: rankを "RETRY" にし、commentは "むむ？よく聞こえなかったぞ。もっと大きな声で、もう一度報告してくれ！" としてください。`;

    // AIへの命令文（プロンプト）
    const prompt = `
      あなたはファンタジーRPGの世界に住む、子供たちの成長を見守る「伝説のギルドマスター」です。
      今から子供が「${questTitle}」というクエスト（お手伝いや宿題などのタスク）の完了報告を音声で行います。
      
      以下の手順で鑑定を行い、厳格なJSON形式のみを出力してください。

      【ステップ1：聞き取り】
      子供の音声を文字起こししてください（transcript）。
      ※音声が聞き取れない場合や無音の場合は、transcriptを"（聞き取れませんでした）"としてください。

      【ステップ2：ランク判定 (rank)】
      以下の基準で S, A, B, C, RETRY のいずれかで評価してください。
      - S: 具体的で元気な報告、または期待以上の成果（例：「全部終わったよ！明日の準備もした！」）。
      - A: しっかり報告できた（例：「終わりました」）。
      - B: 普通、または少し元気がない。
      ${inaudibleInstruction}

      【ステップ3：コメント作成 (comment)】
      子供に向けた50文字以内の「褒め言葉」または「アドバイス」を作成してください。
      - 口調：威厳がありつつも優しい、老賢者のような口調（「〜じゃ」「〜だのう」「見事だ！」など）。
      - 内容：具体的な行動を褒め、次へのやる気を引き出すこと。

      【出力形式】
      余計な前置きやMarkdown記号は一切不要です。以下のJSONオブジェクトのみを出力してください。
      {
        "transcript": "文字起こしテキスト",
        "rank": "S",
        "comment": "コメントテキスト"
      }
    `;

    // 音声データをGeminiへ渡す形式
    const audioPart = {
      inlineData: {
        data: base64Audio,
        mimeType: "audio/mp4",
      },
    };

    // AIに送信！
    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const text = response.text();

    // JSON部分だけを取り出してパースする
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    // ランクに応じたXP計算
    let xp = 0;
    switch (data.rank) {
      case 'S': xp = 100; break;
      case 'A': xp = 50; break;
      case 'B': xp = 30; break;
      case 'C': xp = 10; break;
      case 'RETRY': xp = 0; break; // RETRYならXPなし
    }

    return { ...data, xp_bonus: xp };

  } catch (error) {
    console.error("AI音声鑑定エラー:", error);
    return { 
      transcript: "（エラーが発生しました）",
      rank: "C", 
      comment: "むむ、通信の調子が悪いようだ。今回はCランクとしておこう。",
      xp_bonus: 5 
    };
  }
}