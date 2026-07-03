import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dateFilter = '24hours', countFilter = '10' } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // dateFilter string formatting for prompt
    let dateContext = '최근 24시간';
    if (dateFilter === '3days') dateContext = '최근 3일';
    if (dateFilter === '7days') dateContext = '최근 7일';

    const prompt = `
당신은 ETF 투자 전문가이자 뉴스 큐레이터입니다.
다음 조건에 따라 ${dateContext} 동안의 최신 뉴스를 최대 ${countFilter}건 검색하여 요약해주세요.

[수집 대상]
1. 국내 ETF (KODEX, TIGER, ARIRANG 등)
2. 미국 지수 (S&P 500, 나스닥 100 등)
3. 금리 및 환율 (ETF 가격에 영향을 주는 거시경제 뉴스)

[제외 대상]
- 부동산 뉴스, 암호화폐(코인) 뉴스, 광고성 콘텐츠는 반드시 제외하세요.

[출력 형식]
응답은 반드시 아래 JSON 배열 형태로만 출력해야 합니다. 마크다운 코드 블록(\`\`\`json 등)이나 부가 설명은 절대 포함하지 마세요.

[
  {
    "title": "뉴스 제목",
    "source": "뉴스 출처 (예: 한국경제, Bloomberg 등)",
    "url": "뉴스 원문 링크 (반드시 실제 검색된 URL을 사용할 것)",
    "summary_3line": [
      "핵심 요약 1",
      "핵심 요약 2",
      "핵심 요약 3"
    ],
    "impact_1line": "ETF 투자자에게 미치는 영향 1줄",
    "category": "국내ETF", // "국내ETF", "미국지수", "금리환율" 중 하나만 선택 (이외 값 불가)
    "news_date": "YYYY-MM-DD" // 뉴스 발행 일자
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    let text = response.text || '';
    // Remove markdown code fences and surrounding text to extract JSON securely
    text = text.replace(/^```(json)?/m, '').replace(/```$/m, '').trim();
    if (text.startsWith('```')) {
      text = text.split('\n').slice(1, -1).join('\n').trim();
    }
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      text = match[0];
    }

    let parsedNews: any[] = [];
    try {
      parsedNews = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', e, text);
      return NextResponse.json({ success: true, data: [] });
    }

    // Extract valid URLs from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const validUrls: string[] = [];
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        validUrls.push(chunk.web.uri);
      }
    }

    // Filter and sanitize data
    const finalNews = [];
    for (const item of parsedNews) {
      if (!item.title || !item.url) continue;

      // URL Verification
      const isUrlValid = validUrls.some((u) => u === item.url || u.includes(item.url) || item.url.includes(u));
      if (!isUrlValid) {
        console.warn('Filtered out hallucinated URL:', item.url);
        continue;
      }

      // Enforce Category type
      let category = item.category;
      if (!['국내ETF', '미국지수', '금리환율'].includes(category)) {
        category = '국내ETF'; // fallback
      }

      finalNews.push({
        id: crypto.randomUUID(), // news_id
        title: item.title,
        source: item.source || '알 수 없음',
        url: item.url,
        summary_3line: Array.isArray(item.summary_3line) ? item.summary_3line : [],
        impact_1line: item.impact_1line || null,
        category: category as '국내ETF' | '미국지수' | '금리환율',
        news_date: item.news_date || new Date().toISOString().split('T')[0],
        is_favorite: false,
        created_at: new Date().toISOString(),
      });
    }

    // Apply count filter strictly
    const count = parseInt(countFilter, 10) || 10;
    const limitedNews = finalNews.slice(0, count);

    return NextResponse.json({ success: true, data: limitedNews });
  } catch (error: any) {
    console.error('API /api/news Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}
