 
import { GoogleGenAI, Type } from "@google/genai";
import { DailyGospelReflection, ParishSearchResponse, LiturgicalPrayer } from "../types";

// Validate API key on initialization
const getApiKey = (): string => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('GEMINI_API_KEY is not set. Some features may not work properly.');
  }
  return apiKey || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface GeneratedPrayerResponse {
  bibleVerse: string;
  tradPrayerId: string;
  personalOffering: string;
}

export const getDailyGospelAnalysis = async (lang: 'vi' | 'en'): Promise<DailyGospelReflection> => {
  const today = new Date().toLocaleDateString('vi-VN');
  const cacheKey = `daily_gospel_${today}_${lang}`;

  // 1. Try cache first (only once per day)
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as DailyGospelReflection;
        if (parsed && parsed.verse && parsed.reference && parsed.analysis) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Invalid daily gospel cache, will regenerate.', e);
    }
  }

  // 2. If no valid cache, call AI once and store
  try {
    const prompt =
      lang === 'vi'
        ? `Bạn là một người bạn đồng hành đức tin Công giáo.
Hôm nay là ngày: ${today}.

NHIỆM VỤ:
1. Tìm 1 câu Tin Mừng (Gospel) trong phụng vụ Công giáo hôm nay (hoặc câu Tin Mừng trong ngày gần nhất nếu không xác định được).
2. Trả về:
   - verse: nguyên văn câu Lời Chúa (tiếng Việt, bản dịch thông dụng trong phụng vụ)
   - reference: trích dẫn (ví dụ: Ga 14, 6)
   - analysis: 2-3 câu suy niệm ngắn gọn, gần gũi với người trẻ, giúp áp dụng vào đời sống hằng ngày.

Chỉ trả về JSON đúng cấu trúc.`
        : `You are a Catholic faith companion.
Today is: ${today}.

TASK:
1. Find one Gospel verse from today's Catholic liturgy (or a recent daily Gospel if today is unavailable).
2. Return:
   - verse: the verse text
   - reference: Bible reference (e.g. Jn 14:6)
   - analysis: 2–3 short sentences of reflection, friendly and practical for a young person today.

Return ONLY JSON with these fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            reference: { type: Type.STRING },
            analysis: { type: Type.STRING },
          },
          required: ['verse', 'reference', 'analysis'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as DailyGospelReflection;
    if (parsed && parsed.verse && parsed.reference && parsed.analysis) {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch {
          // ignore quota/storage errors
        }
      }
      return parsed;
    }

    // Fallback if AI response missing fields
    const fallback: DailyGospelReflection = {
      verse: lang === 'vi' ? 'Thầy là đường, là sự thật và là sự sống.' : 'I am the way, the truth and the life.',
      reference: lang === 'vi' ? 'Ga 14, 6' : 'John 14:6',
      analysis:
        lang === 'vi'
          ? 'Chúa mời gọi con tin tưởng nơi Ngài trong từng chọn lựa nhỏ bé của ngày sống.'
          : 'Jesus invites you to trust Him in each small decision of your daily life.',
    };
    return fallback;
  } catch (error) {
    console.error('Error fetching daily gospel:', error);
    return {
      verse: lang === 'vi' ? 'Thầy là đường, là sự thật và là sự sống.' : 'I am the way, the truth and the life.',
      reference: lang === 'vi' ? 'Ga 14, 6' : 'John 14:6',
      analysis:
        lang === 'vi'
          ? 'Chúa mời gọi con tin tưởng nơi Ngài trong từng chọn lựa nhỏ bé của ngày sống.'
          : 'Jesus invites you to trust Him in each small decision of your daily life.',
    };
  }
};

export interface RandomBibleVerse {
  verse: string;
  reference: string;
}

export const generateRandomBibleVerse = async (lang: 'vi' | 'en'): Promise<RandomBibleVerse> => {
  try {
    const cacheKey = `random_bible_verse_${new Date().toDateString()}_${lang}`;
    
    // Check cache first - chỉ gọi API 1 lần mỗi ngày
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as RandomBibleVerse;
          if (parsed && parsed.verse && parsed.reference) {
            console.log('Using cached random Bible verse');
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Invalid random Bible verse cache, will regenerate', e);
      }
    }

    const prompt = lang === 'vi'
      ? `Bạn là một người bạn đồng hành đức tin Công giáo.

Hãy chọn một câu Lời Chúa hay, ngắn gọn (khoảng 10-20 từ), phù hợp với người trẻ Công giáo, có thể là:
- Câu về tình yêu, bình an, hy vọng
- Câu về đức tin, cầu nguyện
- Câu về lòng thương xót, tha thứ
- Câu khích lệ, động viên

TRẢ VỀ JSON với cấu trúc:
{
  "verse": "string (câu Lời Chúa, ngắn gọn 10-20 từ)",
  "reference": "string (trích dẫn, ví dụ: Ga 14, 27 hoặc Mt 11, 28)"
}

YÊU CẦU:
- Chỉ trả về JSON, không thêm lời giải thích
- Câu Lời Chúa phải chính xác, từ Kinh Thánh Công giáo
- Ngôn ngữ: tiếng Việt, bản dịch thông dụng trong phụng vụ`
      : `You are a Catholic faith companion.

Choose a beautiful, concise Bible verse (about 10-20 words) suitable for young Catholics, such as:
- Verses about love, peace, hope
- Verses about faith, prayer
- Verses about mercy, forgiveness
- Encouraging verses

RETURN JSON with structure:
{
  "verse": "string (Bible verse, concise 10-20 words)",
  "reference": "string (Bible reference, e.g. Jn 14:27 or Mt 11:28)"
}

REQUIREMENTS:
- Return JSON ONLY, no explanations
- Bible verse must be accurate, from Catholic Bible
- Language: English`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            reference: { type: Type.STRING }
          },
          required: ["verse", "reference"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as RandomBibleVerse;
    
    if (parsed && parsed.verse && parsed.reference) {
      // Cache the result
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch (e) {
          console.warn('Failed to cache random Bible verse:', e);
        }
      }
      return parsed;
    }

    // Fallback
    return lang === 'vi'
      ? { verse: 'Thầy ban cho các con bình an của Thầy.', reference: 'Ga 14, 27' }
      : { verse: 'Peace I leave with you; my peace I give to you.', reference: 'Jn 14:27' };
  } catch (error) {
    console.error('Error generating random Bible verse:', error);
    return lang === 'vi'
      ? { verse: 'Thầy ban cho các con bình an của Thầy.', reference: 'Ga 14, 27' }
      : { verse: 'Peace I leave with you; my peace I give to you.', reference: 'Jn 14:27' };
  }
};

export const generateGeneralIntentions = async (lang: 'vi' | 'en'): Promise<string[]> => {
  try {
    const todayStr = new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
    const cacheKey = `general_intentions_${todayStr}_${lang}`;
    
    // Check cache first - chỉ gọi API 1 lần mỗi ngày
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as string[];
          if (parsed && Array.isArray(parsed) && parsed.length >= 5) {
            console.log('Using cached general intentions');
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Invalid general intentions cache, will regenerate', e);
      }
    }

    const prompt = lang === 'vi'
      ? `Bạn là một linh mục linh hướng đang đồng hành với người trẻ Công giáo.

Hôm nay là: ${todayStr}.

Hãy đề xuất ĐÚNG 5 Ý NGUYỆN CHUNG để cầu nguyện, mỗi ý nguyện:
- Ngắn gọn, rõ ràng (khoảng 5-10 từ)
- Thiết thực, phù hợp với đời sống người trẻ Công giáo
- Đa dạng các chủ đề: theo ý Đức Giáo Hoàng, cầu nguyện trước khi đi làm, cầu cho gia đình, cầu cho hòa bình thế giới, cầu cho ơn hoán cải, cầu cho người bệnh, cầu cho ơn phân định, v.v.

Ví dụ:
- "Cầu nguyện theo ý Đức Giáo Hoàng"
- "Cầu nguyện trước khi đi làm"
- "Cầu cho gia đình được bình an"
- "Cầu cho hòa bình thế giới"
- "Cầu cho ơn hoán cải tâm hồn"

TRẢ VỀ JSON với cấu trúc:
{
  "intentions": [
    "string (ý nguyện 1)",
    "string (ý nguyện 2)",
    "string (ý nguyện 3)",
    "string (ý nguyện 4)",
    "string (ý nguyện 5)"
  ]
}

YÊU CẦU:
- Chỉ trả về JSON, không thêm lời giải thích
- Nội dung phải hoàn toàn phù hợp với Đức tin Công giáo
- Ngôn ngữ: tiếng Việt, gần gũi, thân thiện.`
      : `You are a Catholic spiritual director accompanying a young Catholic.

Today is: ${todayStr}.

Suggest EXACTLY 5 GENERAL INTENTIONS for prayer, each one:
- Concise and clear (about 5-10 words)
- Practical, suitable for young Catholic life
- Diverse topics: according to the Pope's intentions, prayer before work, prayer for family, prayer for world peace, prayer for conversion, prayer for the sick, prayer for discernment, etc.

Examples:
- "Pray according to the Pope's intentions"
- "Prayer before going to work"
- "Pray for family peace"
- "Pray for world peace"
- "Pray for conversion of heart"

RETURN JSON with structure:
{
  "intentions": [
    "string (intention 1)",
    "string (intention 2)",
    "string (intention 3)",
    "string (intention 4)",
    "string (intention 5)"
  ]
}

REQUIREMENTS:
- Return JSON ONLY, no explanations
- Content must be fully coherent with Catholic faith
- Language: English, warm and encouraging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-5-flash',
      contents: prompt,
      config: { 
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intentions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["intentions"]
        }
      }
    });
    
    const parsed = JSON.parse(response.text || '{}') as { intentions?: string[] };
    let intentions = parsed.intentions || [];
    
    // Validate và normalize
    intentions = intentions
      .filter(i => i && typeof i === 'string' && i.trim().length > 0)
      .slice(0, 5)
      .map(i => i.trim());
    
    // Fallback nếu không đủ 5
    if (intentions.length < 5) {
      const fallback = lang === 'vi'
        ? [
            'Cầu nguyện theo ý Đức Giáo Hoàng',
            'Cầu nguyện trước khi đi làm',
            'Cầu cho gia đình được bình an',
            'Cầu cho hòa bình thế giới',
            'Cầu cho ơn hoán cải tâm hồn'
          ]
        : [
            'Pray according to the Pope\'s intentions',
            'Prayer before going to work',
            'Pray for family peace',
            'Pray for world peace',
            'Pray for conversion of heart'
          ];
      intentions = [...intentions, ...fallback.slice(intentions.length)];
    }
    
    // Cache the result
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(intentions));
      } catch (e) {
        console.warn('Failed to cache general intentions:', e);
      }
    }
    
    return intentions.slice(0, 5);
  } catch (e) { 
    console.error('Error generating general intentions:', e);
    return lang === 'vi'
      ? [
          'Cầu nguyện theo ý Đức Giáo Hoàng',
          'Cầu nguyện trước khi đi làm',
          'Cầu cho gia đình được bình an',
          'Cầu cho hòa bình thế giới',
          'Cầu cho ơn hoán cải tâm hồn'
        ]
      : [
          'Pray according to the Pope\'s intentions',
          'Prayer before going to work',
          'Pray for family peace',
          'Pray for world peace',
          'Pray for conversion of heart'
        ]; 
  }
};

export const generatePrayer = async (theme: string, timeOfDay: string, lang: 'vi' | 'en'): Promise<GeneratedPrayerResponse> => {
  try {
    const prompt = `Bạn là một linh mục linh hướng. Hãy soạn giờ cầu nguyện về: "${theme}".
    
    YÊU CẦU QUAN TRỌNG:
    1. Chọn 1 ID Kinh TRUYỀN THỐNG PHÙ HỢP NHẤT với ngữ cảnh từ danh sách: [dau_thanh_gia, kinh_duc_chua_thanh_than, kinh_vi_dau, kinh_tin, kinh_cay, kinh_kinh_men, kinh_lay_cha, kinh_kinh_mung, kinh_sang_danh, kinh_an_nan_toi, kinh_cao_minh, kinh_tin_kinh, kinh_sang_soi, kinh_duc_thanh_thien_than, kinh_lay_nu_vuong, kinh_hay_nho, kinh_cam_on, kinh_pho_dang, kinh_vuc_sau, kinh_trong_cay, cac_cau_lay].
    2. bibleVerse: 1 câu Kinh Thánh nền tảng.
    3. personalOffering: Đúng 2 câu văn tâm tình cá nhân, xưng "con", dâng lòng biết ơn và lời xin ơn thiết thực.

    Trả về JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bibleVerse: { type: Type.STRING },
            tradPrayerId: { type: Type.STRING },
            personalOffering: { type: Type.STRING }
          },
          required: ["bibleVerse", "tradPrayerId", "personalOffering"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as GeneratedPrayerResponse;
  } catch (error) {
    console.error('Error generating prayer:', error);
    return { 
      bibleVerse: "Ga 14, 27", 
      tradPrayerId: "kinh_lay_cha", 
      personalOffering: "Con tạ ơn Chúa vì sự bình an Ngài ban. Xin dẫn dắt con luôn sống xứng đáng là con cái Chúa. Amen." 
    };
  }
};

export const studyCatechism = async (
  query: string, 
  context: string,
  lang: 'vi' | 'en',
  maxOutputTokens: number = 2000 // Tăng mặc định lên 2000 để đảm bảo đủ cho câu trả lời dài
): Promise<string> => {
  // Normalize query để cache hiệu quả hơn
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');
  const cacheKey = `catechism_${normalizedQuery.substring(0, 100)}_${lang}`;
  
  // Check cache first - nếu đã hỏi rồi thì không gọi API
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log('Using cached Q&A response');
        return cached;
      }
    } catch (e) {
      // ignore cache errors
    }
  }

  try {
    const prompt = lang === 'vi'
      ? `Bạn là một người bạn đồng hành đức tin Công giáo, gần gũi và chân thành. Trò chuyện với một bạn trẻ đang hỏi về đức tin: "${query}"

YÊU CẦU QUAN TRỌNG:
1. Trả lời TỐI ĐA 3 CÂU, mỗi câu ngắn gọn, rõ ràng
2. Các ý được phân tách rõ ràng, dễ hiểu
3. Xưng "mình" hoặc "tớ" và gọi người hỏi là "bạn", như một người bạn đồng hành
4. Giọng điệu thân thiện, lắng nghe, khích lệ, không phán xét
5. KHÔNG dùng markdown, code blocks, hoặc format phức tạp
6. Chỉ trả lời bằng văn bản thuần túy, dễ đọc
7. Nếu câu hỏi mang nội dung tục tĩu, xúc phạm, cổ vũ bạo lực, thù ghét hoặc đi ngược với giáo lý Công giáo, HÃY TỪ CHỐI trả lời một cách nhẹ nhàng và mời bạn đổi sang câu hỏi khác phù hợp hơn.

Trả lời ngắn gọn, súc tích, không quá 3 câu.`
      : `You are a Catholic faith companion, like a close friend walking with the user. They ask about faith: "${query}"

IMPORTANT REQUIREMENTS:
1. Answer in MAXIMUM 3 SENTENCES, each sentence concise and clear
2. Ideas should be clearly separated and easy to understand
3. Use "I" and address the questioner as "you", like a friendly companion
4. Tone: warm, empathetic, encouraging, not judging
5. KHÔNG dùng markdown, code blocks, hoặc format phức tạp
5. DO NOT use markdown, code blocks, or complex formatting
6. Answer in plain text only, easy to read
7. If the question is obscene, offensive, promotes violence/hatred, or clearly contradicts Catholic teaching, you MUST gently refuse to answer and invite the user to ask a different, more suitable question.

Answer briefly and concisely, no more than 3 sentences.`;

    // Đảm bảo maxOutputTokens trong khoảng hợp lệ (1-8192 cho Gemini)
    let validMaxTokens = Math.max(1, Math.min(8192, maxOutputTokens || 2000));
    let response: any;
    let finishReason: string | null = null;
    let retryCount = 0;
    const maxRetries = 1; // Chỉ retry 1 lần nếu bị cắt

    // Retry logic nếu response bị cắt do MAX_TOKENS
    while (retryCount <= maxRetries) {
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: validMaxTokens,
        }
      });
      
      // Kiểm tra finishReason để biết response có bị cắt không
      if (response.candidates && response.candidates.length > 0) {
        finishReason = response.candidates[0].finishReason;
        
        // Nếu bị cắt và chưa retry, tăng maxOutputTokens và thử lại
        if (finishReason === 'MAX_TOKENS' && retryCount < maxRetries) {
          validMaxTokens = Math.min(8192, validMaxTokens * 2); // Tăng gấp đôi
          console.warn(`⚠️ Response truncated. Retrying with maxOutputTokens: ${validMaxTokens}`);
          retryCount++;
          continue; // Retry với maxOutputTokens cao hơn
        } else if (finishReason === 'MAX_TOKENS') {
          console.warn('⚠️ Response may be truncated due to MAX_TOKENS even after retry.');
        }
      }
      
      break; // Thoát vòng lặp nếu không cần retry
    }
    
    // Lấy full text từ response - thử nhiều cách để đảm bảo lấy đầy đủ
    let answer = '';
    
    // Cách 1: Ưu tiên response.text (cách chính thức và nhanh nhất)
    if (response.text && typeof response.text === 'string') {
      answer = response.text.trim();
      // Nếu finishReason là MAX_TOKENS, có thể text đã bị cắt - sẽ thử cách khác
      if (finishReason !== 'MAX_TOKENS' && answer.length > 0) {
        // Text đầy đủ, dùng luôn
      } else if (finishReason === 'MAX_TOKENS') {
        // Text có thể bị cắt, thử lấy từ candidates để so sánh
        console.warn('⚠️ response.text may be truncated. Trying candidates...');
      }
    }
    
    // Cách 2: Lấy từ candidates[0].content.parts (đáng tin cậy, có thể chứa text đầy đủ hơn)
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate && candidate.content && candidate.content.parts) {
        const parts = candidate.content.parts;
        if (parts && parts.length > 0) {
          const extractedText = parts
            .map((part: any) => {
              // Hỗ trợ nhiều định dạng part
              if (typeof part === 'string') return part;
              if (part && typeof part === 'object') {
                if (part.text) return part.text;
                if (part.content) return part.content;
                // Một số API trả về text trực tiếp trong part
                if (part.toString && part.toString !== Object.prototype.toString) {
                  return part.toString();
                }
              }
              return '';
            })
            .filter((text: string) => text && typeof text === 'string' && text.trim().length > 0)
            .join('')
            .trim();
          
          // Nếu text từ candidates dài hơn response.text, dùng candidates
          if (extractedText && (!answer || extractedText.length > answer.length)) {
            answer = extractedText;
          }
        }
      }
    }
    
    // Cách 3: Fallback - thử các trường khác
    if (!answer || answer.length === 0) {
      // Thử response.response
      if ((response as any).response) {
        const responseData = (response as any).response;
        if (responseData.candidates && responseData.candidates[0]) {
          const candidate = responseData.candidates[0];
          if (candidate.content && candidate.content.parts) {
            const parts = candidate.content.parts;
            const fallbackText = parts
              .map((p: any) => p.text || p || '')
              .filter((t: string) => t)
              .join('')
              .trim();
            if (fallbackText) answer = fallbackText;
          }
        }
      }
      
      // Thử response.result hoặc response.data
      if (!answer && (response as any).result) {
        const resultText = String((response as any).result).trim();
        if (resultText) answer = resultText;
      }
    }
    
    // Debug logging để hiểu vấn đề
    if (!answer || answer.length === 0) {
      console.warn('⚠️ Could not extract answer from response:', {
        hasText: !!response.text,
        textLength: response.text?.length || 0,
        hasCandidates: !!(response.candidates && response.candidates.length > 0),
        finishReason: finishReason,
        responseKeys: Object.keys(response)
      });
    } else {
      // Log thông tin để debug
      if (finishReason === 'MAX_TOKENS') {
        console.warn(`⚠️ Answer may be incomplete (finishReason: MAX_TOKENS). Length: ${answer.length} chars`);
      } else {
        console.log(`✅ Answer extracted successfully. Length: ${answer.length} chars, finishReason: ${finishReason || 'STOP'}`);
      }
    }
    
    if (!answer || answer.length === 0) {
      answer = lang === 'vi' ? "Mình đang suy nghĩ..." : "I'm thinking...";
    }
    
    // Kiểm tra xem answer có bị cắt giữa chừng không (không kết thúc bằng dấu câu)
    const lastChar = answer.trim().slice(-1);
    const endsWithPunctuation = /[.!?。！？]/.test(lastChar);
    if (!endsWithPunctuation && finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ Answer appears to be cut off mid-sentence. Consider increasing maxOutputTokens.');
      // Có thể thêm "..." để người dùng biết câu trả lời bị cắt
      // Nhưng không thêm vì có thể làm rối
    }
    
    // Không cắt câu nữa vì prompt đã yêu cầu tối đa 3 câu và maxOutputTokens đã đủ
    // Chỉ trim và làm sạch text
    answer = answer.trim();
    
    // Loại bỏ các ký tự thừa hoặc format không mong muốn
    answer = answer.replace(/\n{3,}/g, '\n\n'); // Giảm nhiều newline xuống 2
    answer = answer.replace(/^\s+|\s+$/gm, ''); // Trim từng dòng
    
    // Đảm bảo answer không bị rỗng sau khi clean
    if (!answer || answer.length === 0) {
      answer = lang === 'vi' ? "Mình đang suy nghĩ..." : "I'm thinking...";
    }
    
    // Cache the result (giới hạn 100 câu hỏi gần nhất để tránh localStorage đầy)
    if (typeof localStorage !== 'undefined' && answer) {
      try {
        // Giữ tối đa 100 Q&A để tránh localStorage đầy
        const keys = Object.keys(localStorage).filter(k => k.startsWith('catechism_'));
        if (keys.length > 100) {
          // Xóa các entry cũ nhất (giữ lại 100 mới nhất)
          keys.slice(0, keys.length - 100).forEach(k => localStorage.removeItem(k));
        }
        localStorage.setItem(cacheKey, answer);
      } catch (e) {
        // ignore storage errors
      }
    }
    
    return answer;
  } catch (error) {
    console.error('Error studying catechism:', error);
    return lang === 'vi' 
      ? "Xin lỗi bạn, mình đang gặp chút vấn đề kỹ thuật. Bạn thử lại sau nhé!" 
      : "Sorry, I'm experiencing some technical issues. Please try again later!";
  }
};

// Generate 3 simple daily faith missions using AI
export interface GeneratedDailyMission {
  title: string;
  description: string;
  icon: string;
  graceReward: number;
}

export interface GeneratedWeeklyMission {
  title: string;
  description: string;
  icon: string;
  graceReward: number;
}

export const generateDailyFaithMissions = async (lang: 'vi' | 'en'): Promise<GeneratedDailyMission[]> => {
  try {
    const todayStr = new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
    const cacheKey = `daily_missions_${todayStr}_${lang}`;
    
    // Check cache first - chỉ gọi API 1 lần mỗi ngày
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as GeneratedDailyMission[];
          if (parsed && Array.isArray(parsed) && parsed.length === 3) {
            console.log('Using cached daily missions');
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Invalid daily missions cache, will regenerate', e);
      }
    }

    const prompt =
      lang === 'vi'
        ? `Bạn là một linh mục linh hướng đang đồng hành với người trẻ Công giáo.

Hôm nay là ngày: ${todayStr}.

Hãy đề xuất ĐÚNG 3 SỨ VỤ ĐỨC TIN TRONG NGÀY dành cho một bạn trẻ bận rộn, mỗi sứ vụ:
- Ngắn gọn, cụ thể, có thể thực hiện trong ngày (5–15 phút)
- Gắn với đời sống cầu nguyện, Lời Chúa, bác ái, hiệp thông với Giáo hội

LƯU Ý QUAN TRỌNG: Nếu có sứ vụ về "việc thiện" hoặc "bác ái", hãy gợi ý: "Nếu con chưa biết làm việc thiện gì, hãy ủng hộ quỹ Caritas giáo phận để giúp đỡ những người có hoàn cảnh khó khăn hơn" hoặc tương tự. Đây là một cách cụ thể và thiết thực để thực hành bác ái.

TRẢ VỀ JSON với cấu trúc CHÍNH XÁC:
{
  "missions": [
    {
      "title": "string (tối đa ~40 ký tự, ví dụ: Kinh Sáng dâng ngày)",
      "description": "string (1–2 câu ngắn, giải thích cụ thể việc cần làm)",
      "icon": "string (tên icon Font Awesome dạng fa-*, ví dụ: fa-sun, fa-bible, fa-heart, fa-hands-praying, fa-church, fa-people-group)",
      "graceReward": number (từ 15 đến 40, càng khó càng nhiều điểm)"
    }
  ]
}

YÊU CẦU:
- Chỉ trả về JSON, không thêm lời giải thích
- Nội dung phải hoàn toàn phù hợp với Đức tin Công giáo
- Ngôn ngữ: tiếng Việt, gần gũi, thân thiện.`
        : `You are a Catholic spiritual director accompanying a busy young adult.

Today is: ${todayStr}.

Suggest EXACTLY 3 DAILY FAITH MISSIONS the person can realistically do today (5–15 minutes each), each one:
- Concrete and practical (prayer, Scripture, charity, communion with the Church)

IMPORTANT NOTE: If there is a mission about "charity" or "good works", please suggest: "If you don't know what good deed to do, support the Caritas Diocese Fund to help those in difficult circumstances" or similar. This is a concrete and practical way to practice charity.

RETURN STRICT JSON with this shape:
{
  "missions": [
    {
      "title": "string (max ~40 chars, e.g. Morning offering)",
      "description": "string (1–2 short sentences explaining the action)",
      "icon": "string (Font Awesome icon name like fa-sun, fa-bible, fa-heart, fa-hands-praying, fa-church, fa-people-group)",
      "graceReward": number (between 15 and 40, higher for more demanding missions)"
    }
  ]
}

REQUIREMENTS:
- Return JSON ONLY, no explanations
- Content must be fully coherent with Catholic faith
- Language: English, warm and encouraging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  graceReward: { type: Type.NUMBER }
                },
                required: ["title", "description"]
              }
            }
          },
          required: ["missions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as { missions?: GeneratedDailyMission[] };
    let missions = parsed.missions || [];

    // Basic validation & normalization
    missions = missions
      .filter(m => m && m.title && m.description)
      .slice(0, 3)
      .map((m, idx) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        icon: m.icon && m.icon.startsWith('fa-') ? m.icon : (idx === 0 ? 'fa-sun' : idx === 1 ? 'fa-bible' : 'fa-heart'),
        graceReward:
          typeof m.graceReward === 'number' && m.graceReward >= 10 && m.graceReward <= 80
            ? Math.round(m.graceReward)
            : 20 + idx * 5
      }));

    // Fallback if AI returned nothing useful
    if (missions.length === 0) {
      missions = [
        {
          title: lang === 'vi' ? 'Kinh Sáng dâng ngày' : 'Morning Offering',
          description:
            lang === 'vi'
              ? 'Dành 5 phút đầu ngày dâng công việc, niềm vui và khó khăn cho Chúa.'
              : 'Spend 5 minutes in the morning offering your day, joys and struggles to God.',
          icon: 'fa-sun',
          graceReward: 20
        },
        {
          title: lang === 'vi' ? 'Lắng nghe Lời Chúa' : 'Listen to the Word',
          description:
            lang === 'vi'
              ? 'Đọc chậm rãi một đoạn Tin Mừng hôm nay và giữ lại một câu đánh động con.'
              : 'Read today’s Gospel slowly and keep one verse that touches your heart.',
          icon: 'fa-bible',
          graceReward: 25
        },
        {
          title: lang === 'vi' ? 'Một việc bác ái nhỏ' : 'A small act of charity',
          description:
            lang === 'vi'
              ? 'Chủ động làm một cử chỉ yêu thương cụ thể cho người đang cần bên cạnh con.'
              : 'Do one concrete act of love for someone in need around you.',
          icon: 'fa-heart',
          graceReward: 30
        }
      ];
    }

    // Cache the result - chỉ cache 1 lần mỗi ngày
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(missions));
      } catch (e) {
        console.warn('Failed to cache daily missions:', e);
      }
    }

    return missions;
  } catch (error) {
    console.error('Error generating daily faith missions:', error);
    // Safe static fallback
    return [
      {
        title: lang === 'vi' ? 'Kinh Sáng dâng ngày' : 'Morning Offering',
        description:
          lang === 'vi'
            ? 'Dâng ngày mới cho Chúa ngay khi thức dậy.'
            : 'Offer your new day to God as soon as you wake up.',
        icon: 'fa-sun',
        graceReward: 20
      },
      {
        title: lang === 'vi' ? 'Lời Chúa hôm nay' : 'Scripture today',
        description:
          lang === 'vi'
            ? 'Đọc và suy niệm ít nhất 1 câu Lời Chúa.'
            : 'Read and meditate at least one verse of Scripture.',
        icon: 'fa-bible',
        graceReward: 25
      },
      {
        title: lang === 'vi' ? 'Cử chỉ bác ái' : 'Act of charity',
        description:
          lang === 'vi'
            ? 'Làm một việc tốt nhỏ cho người xung quanh.'
            : 'Do one small act of kindness for someone near you.',
        icon: 'fa-heart',
        graceReward: 30
      }
    ];
  }
};

export const generateWeeklyFaithMissions = async (lang: 'vi' | 'en'): Promise<GeneratedWeeklyMission[]> => {
  try {
    // Tính tuần hiện tại (bắt đầu từ Chủ Nhật)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Chủ Nhật
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const weekStr = startOfWeek.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US');
    const cacheKey = `weekly_missions_${weekStr}_${lang}`;
    
    // Check cache first - chỉ gọi API 1 lần mỗi tuần
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as GeneratedWeeklyMission[];
          if (parsed && Array.isArray(parsed) && parsed.length >= 2) {
            console.log('Using cached weekly missions');
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Invalid weekly missions cache, will regenerate', e);
      }
    }

    const prompt =
      lang === 'vi'
        ? `Bạn là một linh mục linh hướng đang đồng hành với người trẻ Công giáo.

Tuần này bắt đầu từ: ${weekStr}.

Hãy đề xuất ĐÚNG 3 SỨ VỤ ĐỨC TIN TRONG TUẦN dành cho một bạn trẻ, mỗi sứ vụ:
- Có thể thực hiện trong tuần (không nhất thiết phải làm ngay trong ngày)
- Cụ thể, thiết thực, gắn với đời sống đức tin Công giáo
- Có thể là: tham dự Thánh lễ, Bí tích Hòa giải, bác ái, học giáo lý, chầu Thánh Thể, cầu nguyện cho Giáo Hội, tham gia sinh hoạt giáo xứ, v.v.
- Phần thưởng graceReward từ 80 đến 150 (càng khó càng nhiều điểm)

TRẢ VỀ JSON với cấu trúc CHÍNH XÁC:
{
  "missions": [
    {
      "title": "string (tối đa ~40 ký tự, ví dụ: Thánh Lễ Chủ Nhật)",
      "description": "string (1–2 câu ngắn, giải thích cụ thể việc cần làm trong tuần)",
      "icon": "string (tên icon Font Awesome dạng fa-*, ví dụ: fa-church, fa-hands-asl-interpreting, fa-hand-holding-heart, fa-book-open, fa-bread-slice, fa-people-group, fa-globe)",
      "graceReward": number (từ 80 đến 150, càng khó càng nhiều điểm)"
    }
  ]
}

YÊU CẦU:
- Chỉ trả về JSON, không thêm lời giải thích
- Nội dung phải hoàn toàn phù hợp với Đức tin Công giáo
- Ngôn ngữ: tiếng Việt, gần gũi, thân thiện.
- Đa dạng các loại nhiệm vụ để nâng cao đời sống đức tin.`
        : `You are a Catholic spiritual director accompanying a young Catholic.

This week starts from: ${weekStr}.

Suggest EXACTLY 3 WEEKLY FAITH MISSIONS the person can do this week, each one:
- Can be done within the week (not necessarily on the same day)
- Concrete, practical, connected to Catholic faith life
- Can be: attending Mass, Sacrament of Reconciliation, charity, learning catechism, Eucharistic Adoration, praying for the Church, participating in parish activities, etc.
- graceReward from 80 to 150 (higher for more demanding missions)

RETURN STRICT JSON with this shape:
{
  "missions": [
    {
      "title": "string (max ~40 chars, e.g. Sunday Mass)",
      "description": "string (1–2 short sentences explaining what to do this week)",
      "icon": "string (Font Awesome icon name like fa-church, fa-hands-asl-interpreting, fa-hand-holding-heart, fa-book-open, fa-bread-slice, fa-people-group, fa-globe)",
      "graceReward": number (between 80 and 150, higher for more demanding missions)"
    }
  ]
}

REQUIREMENTS:
- Return JSON ONLY, no explanations
- Content must be fully coherent with Catholic faith
- Language: English, warm and encouraging.
- Diversify mission types to enhance faith life.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  graceReward: { type: Type.NUMBER }
                },
                required: ["title", "description"]
              }
            }
          },
          required: ["missions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as { missions?: GeneratedWeeklyMission[] };
    let missions = parsed.missions || [];

    // Basic validation & normalization
    missions = missions
      .filter(m => m && m.title && m.description)
      .slice(0, 3)
      .map((m, idx) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        icon: m.icon && m.icon.startsWith('fa-') ? m.icon : (idx === 0 ? 'fa-church' : idx === 1 ? 'fa-heart' : 'fa-book-open'),
        graceReward:
          typeof m.graceReward === 'number' && m.graceReward >= 80 && m.graceReward <= 150
            ? Math.round(m.graceReward)
            : 100 + idx * 10
      }));

    // Fallback if AI returned nothing useful
    if (missions.length === 0) {
      missions = [
        {
          title: lang === 'vi' ? 'Tham dự Thánh Lễ' : 'Attend Mass',
          description:
            lang === 'vi'
              ? 'Tham dự ít nhất một Thánh lễ trong tuần này.'
              : 'Attend at least one Mass this week.',
          icon: 'fa-church',
          graceReward: 100
        },
        {
          title: lang === 'vi' ? 'Việc Bác Ái' : 'Act of Charity',
          description:
            lang === 'vi'
              ? 'Giúp đỡ một người nghèo hoặc người gặp khó khăn trong tuần.'
              : 'Help someone in need this week.',
          icon: 'fa-hand-holding-heart',
          graceReward: 120
        },
        {
          title: lang === 'vi' ? 'Học Giáo Lý' : 'Learn Catechism',
          description:
            lang === 'vi'
              ? 'Dành thời gian tìm hiểu thêm về đức tin trong tuần.'
              : 'Spend time learning more about the faith this week.',
          icon: 'fa-book-open',
          graceReward: 80
        }
      ];
    }

    // Cache the result - chỉ cache 1 lần mỗi tuần
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(missions));
      } catch (e) {
        console.warn('Failed to cache weekly missions:', e);
      }
    }

    return missions;
  } catch (error) {
    console.error('Error generating weekly faith missions:', error);
    // Safe static fallback
    return [
      {
        title: lang === 'vi' ? 'Tham dự Thánh Lễ' : 'Attend Mass',
        description:
          lang === 'vi'
            ? 'Tham dự ít nhất một Thánh lễ trong tuần.'
            : 'Attend at least one Mass this week.',
        icon: 'fa-church',
        graceReward: 100
      },
      {
        title: lang === 'vi' ? 'Bác Ái' : 'Charity',
        description:
          lang === 'vi'
            ? 'Giúp đỡ một người nghèo hoặc người gặp khó khăn.'
            : 'Help someone poor or in difficulty.',
        icon: 'fa-hand-holding-heart',
        graceReward: 120
      },
      {
        title: lang === 'vi' ? 'Học Giáo Lý' : 'Learn Catechism',
        description:
          lang === 'vi'
            ? 'Dành thời gian tìm hiểu thêm về đức tin.'
            : 'Spend time learning more about the faith.',
        icon: 'fa-book-open',
        graceReward: 80
      }
    ];
  }
};

export const searchNearbyParishes = async (locationHint: string, lang: 'vi' | 'en'): Promise<ParishSearchResponse> => {
  try {
    const prompt =
      lang === 'vi'
        ? `Bạn là một hướng dẫn viên Công giáo am hiểu địa phương.
Người dùng đang ở khu vực: "${locationHint}".
Hãy liệt kê đúng 5 Nhà thờ Công giáo gần nhất (có thật ngoài đời nếu có thể), với:
1) name: Tên giáo xứ / nhà thờ
2) address: Địa chỉ đầy đủ, rõ ràng
3) massSchedules: lịch lễ tiêu biểu trong tuần (day: Thứ / Chúa nhật, times: ["HH:MM", ...])

Khi xác định lịch lễ, hãy CỰC KỲ ƯU TIÊN CÁC NGUỒN CHÍNH THỐNG sau (nếu có thể):
- Website chính thức của giáo phận hoặc giáo xứ
  (ví dụ cho Hà Nội: trang Tổng Giáo Phận Hà Nội và các trang con, như "Giáo hạt Chính tòa" tại https://www.tonggiaophanhanoi.org/giao-hat-chinh-toa/ và trang riêng của từng giáo xứ)
- Bản tin / lịch lễ trên website hoặc bảng tin giáo xứ

Chỉ sử dụng các nguồn khác (Google Maps, Google Business Profile, các trang/tài khoản mạng xã hội...) để THAM KHẢO THÊM khi không có thông tin rõ ràng trên nguồn chính thức.

Nếu nhiều nguồn khác nhau, hãy:
- Ưu tiên giờ lễ trùng khớp giữa các nguồn
- Luôn chọn thông tin từ nguồn chính thức (website giáo phận/giáo xứ) nếu có

Trả về JSON đúng cấu trúc:
{
  "parishes": [
    { "name": string, "address": string, "massSchedules": [{ "day": string, "times": string[] }] }
  ],
  "sources": [
    { "title": string, "uri": string }
  ]
}

Không thêm bất kỳ nội dung nào ngoài JSON.`
        : `You are a Catholic local guide.
The user is near: "${locationHint}".
List exactly 5 nearby Catholic churches (real ones if possible) with:
1) name: Parish / church name
2) address: Full human-readable address
3) massSchedules: typical weekly Mass times (day: e.g. "Sunday", "Weekday", times: ["HH:MM", ...])

When determining massSchedules, STRONGLY PRIORITIZE OFFICIAL SOURCES:
- Official diocesan websites and parish sub-pages
  (for example, for Ha Noi: the Archdiocese of Ha Noi site and its deanery/parish pages, such as "Giáo hạt Chính tòa" at https://www.tonggiaophanhanoi.org/giao-hat-chinh-toa/ and each parish's page)
- Official parish/diocesan bulletins or published schedules

Only use other public sources (Google Maps, Google Business profiles, social media pages, etc.) as SECONDARY references when official information is missing or unclear.

If multiple sources disagree:
- Prefer times that match across sources
- Always favour the most official source (diocesan/parish website) when available

Return strict JSON with shape:
{
  "parishes": [
    { "name": string, "address": string, "massSchedules": [{ "day": string, "times": string[] }] }
  ],
  "sources": [
    { "title": string, "uri": string }
  ]
}

Do NOT include anything except JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parishes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  massSchedules: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING },
                        times: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      },
                      required: ["day", "times"]
                    }
                  }
                },
                required: ["name", "address"]
              }
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  uri: { type: Type.STRING }
                },
                required: ["title", "uri"]
              }
            }
          },
          required: ["parishes"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}') as ParishSearchResponse;
    return {
      parishes: json.parishes || [],
      sources: json.sources || []
    };
  } catch (error) {
    console.error('Error searching nearby parishes:', error);
    return {
      parishes: [],
      sources: []
    };
  }
};

export const getLiturgicalPrayers = async (lang: 'vi' | 'en', forceRefresh: boolean = false): Promise<LiturgicalPrayer> => {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('vi-VN');
    const dayOfWeek = today.toLocaleDateString('vi-VN', { weekday: 'long' });
    const cacheKey = `liturgical_prayers_${dateStr}_${lang}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Verify it's for today
          if (parsed.day === dateStr) {
            console.log('Using cached liturgical prayers');
            return parsed as LiturgicalPrayer;
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }
    }
    
    const prompt = lang === 'vi'
      ? `Bạn là chuyên gia phụng vụ Công giáo. Hãy cung cấp CÁC GIỜ KINH PHỤNG VỤ đầy đủ và chính xác cho ngày ${dateStr} (${dayOfWeek}), theo đúng sách Các Giờ Kinh Phụng Vụ hiện hành.

YÊU CẦU BẮT BUỘC:
1. Xác định chính xác ngày lễ phụng vụ hôm nay (ví dụ: "Chúa Nhật II Mùa Vọng", "Thứ Hai sau Chúa Nhật...", "Lễ thánh...")
2. Xác định màu phụng vụ (trắng, đỏ, xanh, tím, hồng)
3. Nếu có thánh được kính, ghi tên thánh

CÁC GIỜ KINH CẦN CUNG CẤP:
- Kinh Sách (readings) - chỉ nếu là ngày lễ lớn
- Kinh Sáng (morning) - BẮT BUỘC
- Kinh Trưa (midday) - BẮT BUỘC
- Kinh Chiều (evening) - BẮT BUỘC
- Kinh Tối (night) - BẮT BUỘC

CẤU TRÚC MỖI GIỜ KINH (PHẢI ĐẦY ĐỦ):

1. opening (Lời mở đầu): Giáo đầu của giờ kinh, ví dụ "Lạy Chúa Trời, xin mở miệng con, cho con cất tiếng ngợi khen Ngài."

2. psalms (Thánh vịnh): Mảng các Thánh vịnh, MỖI VỊNH gồm:
   - number: Số vịnh (ví dụ: "Tv 94 (95)", "Tv 99 (100)")
   - antiphon: Điệp ca (ĐC) - câu ngắn, ví dụ: "Hãy đến đây ta reo hò mừng Chúa"
   - verses: Mảng các câu thánh vịnh (ít nhất 5-10 câu)
   - glory: "Vinh danh Chúa Cha và Chúa Con, cùng vinh danh Thánh Thần Thiên Chúa..."
   Mỗi giờ kinh PHẢI có ít nhất 2-3 Thánh vịnh.

3. shortReading (Bài đọc ngắn):
   - reference: Tham chiếu Kinh Thánh (ví dụ: "Is 40,1-5", "1 Cr 13,4-7")
   - content: Nội dung đầy đủ của đoạn Kinh Thánh

4. responsory (Đáp ca): Câu xướng đáp sau bài đọc, ví dụ: "Lạy Chúa, xin dạy con biết đường lối Chúa."

5. gospelCanticle (Ca vịnh Tin Mừng):
   - Kinh Sáng: Bài ca của Zechariah (Benedictus) - Lc 1,68-79
   - Kinh Chiều: Bài ca của Đức Maria (Magnificat) - Lc 1,46-55
   - Kinh Tối: Bài ca của Simeon (Nunc Dimittis) - Lc 2,29-32
   Mỗi ca vịnh gồm:
   - title: Tên ca vịnh
   - antiphon: Điệp ca
   - content: Nội dung đầy đủ

6. intercessions (Lời cầu):
   - title: Tiêu đề (ví dụ: "Lời cầu")
   - prayers: Mảng các lời cầu (ít nhất 3-5 lời cầu)

7. concludingPrayer (Lời nguyện): Lời nguyện kết thúc giờ kinh, bắt đầu bằng "Lạy Chúa..." hoặc "Lạy Thiên Chúa..."

QUAN TRỌNG:
- Tất cả nội dung phải bằng tiếng Việt, trang trọng
- Mỗi phần phải có nội dung đầy đủ, không được để trống
- Thánh vịnh phải có đủ các câu, không được rút ngắn
- Trả về JSON đúng cấu trúc, đầy đủ tất cả các giờ kinh`
      : `You are a Catholic liturgical expert. Provide COMPLETE and ACCURATE Liturgical Hours for ${dateStr} (${dayOfWeek}), according to the current Liturgy of the Hours.

REQUIRED:
1. Accurately identify today's liturgical date (e.g., "Second Sunday of Advent", "Monday after...", "Feast of...")
2. Identify liturgical color (white, red, green, purple, pink)
3. If there's a saint celebrated today, include the saint's name

HOURS TO PROVIDE:
- Office of Readings (readings) - only for major feasts
- Morning Prayer (morning) - REQUIRED
- Midday Prayer (midday) - REQUIRED
- Evening Prayer (evening) - REQUIRED
- Night Prayer (night) - REQUIRED

STRUCTURE FOR EACH HOUR (MUST BE COMPLETE):

1. opening: Opening prayer of the hour, e.g., "O God, come to my assistance..."

2. psalms: Array of psalms, EACH PSALM includes:
   - number: Psalm number (e.g., "Ps 94 (95)", "Ps 99 (100)")
   - antiphon: Antiphon - short verse, e.g., "Come, let us sing to the Lord"
   - verses: Array of psalm verses (at least 5-10 verses)
   - glory: "Glory to the Father, and to the Son, and to the Holy Spirit..."
   Each hour MUST have at least 2-3 psalms.

3. shortReading:
   - reference: Bible reference (e.g., "Is 40:1-5", "1 Cor 13:4-7")
   - content: Full content of the Bible passage

4. responsory: Response verse after the reading, e.g., "Teach me your ways, O Lord."

5. gospelCanticle:
   - Morning Prayer: Canticle of Zechariah (Benedictus) - Lk 1:68-79
   - Evening Prayer: Canticle of Mary (Magnificat) - Lk 1:46-55
   - Night Prayer: Canticle of Simeon (Nunc Dimittis) - Lk 2:29-32
   Each canticle includes:
   - title: Name of the canticle
   - antiphon: Antiphon
   - content: Full content

6. intercessions:
   - title: Title (e.g., "Intercessions")
   - prayers: Array of intercessions (at least 3-5 prayers)

7. concludingPrayer: Concluding prayer of the hour, starting with "Lord..." or "God..."

IMPORTANT:
- All content must be in dignified, liturgical structure
- Each part must have complete content, cannot be empty
- Psalms must have all verses, cannot be shortened
- Return strict JSON format with all hours complete`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.5, // Lower temperature for faster, more consistent responses
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            liturgicalDate: { type: Type.STRING },
            saint: { type: Type.STRING },
            color: { type: Type.STRING },
            hours: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hour: { type: Type.STRING, enum: ['readings', 'morning', 'midday', 'evening', 'night'] },
                  title: { type: Type.STRING },
                  opening: { type: Type.STRING }, // Lời mở đầu - BẮT BUỘC
                  psalms: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        number: { type: Type.STRING },
                        antiphon: { type: Type.STRING },
                        verses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        glory: { type: Type.STRING }
                      },
                      required: ["number", "antiphon", "verses"]
                    }
                  },
                  shortReading: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      reference: { type: Type.STRING },
                      content: { type: Type.STRING }
                    },
                    required: ["reference", "content"]
                  },
                  responsory: { type: Type.STRING }, // Đáp ca
                  gospelCanticle: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      antiphon: { type: Type.STRING },
                      content: { type: Type.STRING }
                    },
                    required: ["title", "antiphon", "content"]
                  },
                  intercessions: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      prayers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  concludingPrayer: { type: Type.STRING }, // Lời nguyện - BẮT BUỘC
                  hymn: { type: Type.STRING },
                  dismissal: { type: Type.STRING },
                  marianAnthem: { type: Type.STRING }
                },
                required: ["hour", "title", "opening", "psalms", "concludingPrayer"]
              }
            }
          },
          required: ["day", "liturgicalDate", "hours"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as any;
    
    // Validate and clean up the data
    const validatedHours = (result.hours || []).map((hour: any) => {
      // Ensure required fields exist
      if (!hour.opening) hour.opening = lang === 'vi' ? 'Lạy Chúa Trời, xin mở miệng con, cho con cất tiếng ngợi khen Ngài.' : 'O God, come to my assistance.';
      if (!hour.psalms || !Array.isArray(hour.psalms) || hour.psalms.length === 0) {
        hour.psalms = [{
          number: lang === 'vi' ? 'Tv 94 (95)' : 'Ps 94 (95)',
          antiphon: lang === 'vi' ? 'Hãy đến đây ta reo hò mừng Chúa' : 'Come, let us sing to the Lord',
          verses: [lang === 'vi' ? 'Hãy đến đây ta reo hò mừng Chúa, tung hô Người là núi đá độ trì ta.' : 'Come, let us sing to the Lord, shout with joy to the rock of our salvation.'],
          glory: lang === 'vi' ? 'Vinh danh Chúa Cha và Chúa Con, cùng vinh danh Thánh Thần Thiên Chúa.' : 'Glory to the Father, and to the Son, and to the Holy Spirit.'
        }];
      }
      if (!hour.concludingPrayer) {
        hour.concludingPrayer = lang === 'vi' 
          ? 'Lạy Chúa, xin chúc lành cho chúng con và gìn giữ chúng con trong ngày hôm nay. Amen.'
          : 'Lord, bless us and keep us safe this day. Amen.';
      }
      return hour;
    });
    
    const liturgicalPrayer: LiturgicalPrayer = {
      day: dateStr,
      liturgicalDate: result.liturgicalDate || dateStr,
      saint: result.saint || '',
      color: result.color || 'green',
      hours: validatedHours
    };
    
    // Log for debugging
    console.log('Liturgical prayer loaded:', {
      day: liturgicalPrayer.day,
      liturgicalDate: liturgicalPrayer.liturgicalDate,
      hoursCount: liturgicalPrayer.hours.length,
      hours: liturgicalPrayer.hours.map(h => ({ hour: h.hour, hasPsalms: h.psalms?.length || 0, hasOpening: !!h.opening, hasPrayer: !!h.concludingPrayer }))
    });

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify(liturgicalPrayer));
    } catch (e) {
      console.warn('Failed to cache liturgical prayers:', e);
    }

    return liturgicalPrayer;
  } catch (error) {
    console.error('Error fetching liturgical prayers:', error);
    
    // Try to return cached data even if API fails
    const today = new Date().toLocaleDateString('vi-VN');
    const cacheKey = `liturgical_prayers_${today}_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.day === today) {
          console.log('Returning cached data due to API error');
          return parsed as LiturgicalPrayer;
        }
      } catch (e) {
        // Invalid cache
      }
    }
    
    // Return empty structure if all else fails
    return {
      day: today,
      liturgicalDate: lang === 'vi' ? 'Chúa Nhật thường niên' : 'Ordinary Sunday',
      color: 'green',
      hours: []
    };
  }
};

