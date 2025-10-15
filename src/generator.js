import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NewsletterGenerator {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateContent(topic) {
    console.log(`\n주제 "${topic}"에 대한 콘텐츠를 생성 중...`);

    const prompt = `당신은 전문적인 뉴스레터 작성자입니다.
주제: ${topic}

다음 요구사항에 맞춰 뉴스레터 콘텐츠를 작성해주세요:

1. 주제(H1)에 맞는 5가지 소주제(H2)를 구성
2. 전체 흐름을 거스르지 않고 각 소주제에 맞는 글 작성
3. 각 소주제의 글(H3)은 2000자 내외(한국어 기준)로 작성
4. 전체 글의 양은 12000자를 넘기지 않음

응답 형식:
{
  "mainTitle": "메인 제목",
  "subtitle": "부제목 (한 줄 설명)",
  "issueNumber": "ISSUE #001 | 2025년 10월",
  "heroLabel": "이번 주 핵심 주제",
  "heroTitle": "히어로 섹션 제목",
  "heroDescription": "히어로 섹션 설명",
  "quoteText": "영감을 주는 인용구",
  "quoteAuthor": "인용구 출처",
  "sections": [
    {
      "title": "소주제 1 제목",
      "icon": "이모지",
      "summary": "간단한 요약 (100자 이내)",
      "content": "상세 내용 (2000자 내외)"
    }
    // ... 총 5개 섹션
  ],
  "insightTitle": "인사이트 제목",
  "insightText": "인사이트 내용",
  "stats": [
    {"number": "40%", "label": "통계 레이블"},
    {"number": "7시간", "label": "통계 레이블"},
    {"number": "150분", "label": "통계 레이블"}
  ],
  "ctaTitle": "행동 유도 제목",
  "ctaButton": "버튼 텍스트",
  "familyTips": [
    "팁 1",
    "팁 2",
    "팁 3",
    "팁 4"
  ],
  "psText": "추신 내용"
}

JSON 형식으로만 응답해주세요.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = message.content[0].text;

      // JSON 추출 (코드 블록이 있을 경우 제거)
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.match(/```json\n([\s\S]*?)\n```/)?.[1] || content;
      } else if (content.includes('```')) {
        jsonContent = content.match(/```\n([\s\S]*?)\n```/)?.[1] || content;
      }

      return JSON.parse(jsonContent.trim());
    } catch (error) {
      console.error('콘텐츠 생성 중 오류 발생:', error);
      throw error;
    }
  }

  async generateHTML(contentData) {
    const templatePath = path.join(__dirname, '..', 'templates', 'template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // 기본 정보 치환
    template = template.replace(/ISSUE #001 \| 2025년 10월/g, contentData.issueNumber);
    template = template.replace(/희망의 기억/g, contentData.mainTitle);
    template = template.replace(/알츠하이머 치매 예방과 극복을 위한 실천 가이드/g, contentData.subtitle);

    // 히어로 섹션
    template = template.replace(/이번 주 핵심 주제/g, contentData.heroLabel);
    template = template.replace(/뇌 건강을 지키는<br>5가지 생활습관/g, contentData.heroTitle);
    template = template.replace(
      /최신 신경과학 연구에 따르면.*?소개합니다\./gs,
      contentData.heroDescription
    );

    // 인용구
    template = template.replace(
      /뇌는 평생 변화할 수 있습니다\.<br>\s*지금 시작하는 것이 결코 늦지 않았습니다\./g,
      contentData.quoteText
    );
    template = template.replace(/— 김상윤 교수, 서울대병원 신경과/g, contentData.quoteAuthor);

    // 섹션 제목
    template = template.replace(/오늘부터 실천하는 3가지 방법/g, `오늘부터 실천하는 ${contentData.sections.length}가지 방법`);

    // 3개 컬럼 카드 생성
    const columnsHTML = contentData.sections.slice(0, 3).map(section => `
                <div class="column-card">
                    <div class="column-icon">${section.icon}</div>
                    <div class="column-title">${section.title}</div>
                    <p class="column-text">
                        ${section.summary}
                    </p>
                </div>
    `).join('\n');

    // 컬럼 카드 치환
    template = template.replace(
      /<div class="three-columns">[\s\S]*?<\/div>\s*<\/div>/,
      `<div class="three-columns">\n${columnsHTML}\n            </div>`
    );

    // 인사이트 박스
    template = template.replace(/🔬 이번 주 연구 인사이트/g, contentData.insightTitle);
    template = template.replace(
      /하버드 의대의 20년 추적 연구 결과.*?보여주는 결과입니다\./gs,
      contentData.insightText
    );

    // 통계 데이터
    if (contentData.stats && contentData.stats.length === 3) {
      template = template.replace(
        /<div class="stats-grid">[\s\S]*?<\/div>\s*<\/div>/,
        `<div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${contentData.stats[0].number}</div>
                    <div class="stat-label">${contentData.stats[0].label}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${contentData.stats[1].number}</div>
                    <div class="stat-label">${contentData.stats[1].label}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${contentData.stats[2].number}</div>
                    <div class="stat-label">${contentData.stats[2].label}</div>
                </div>
            </div>`
      );
    }

    // CTA 섹션
    template = template.replace(/뇌 건강 체크리스트<br>무료 다운로드/g, contentData.ctaTitle);
    template = template.replace(/PDF 받기/g, contentData.ctaButton);

    // 가족 팁
    if (contentData.familyTips && contentData.familyTips.length > 0) {
      const tipsHTML = contentData.familyTips.map(tip => `<li>${tip}</li>`).join('\n                    ');
      template = template.replace(
        /<div class="family-tips">[\s\S]*?<\/div>/,
        `<div class="family-tips">
                <ul>
                    ${tipsHTML}
                </ul>
            </div>`
      );
    }

    // P.S. 섹션
    template = template.replace(
      /다음 주에는 "기억력 강화를 위한 마인드 트레이닝"을 다룹니다\.[\s\S]*?구독하시면 이메일로 자동 전송됩니다!/g,
      contentData.psText
    );

    // 제목 업데이트
    template = template.replace(/<title>.*?<\/title>/, `<title>${contentData.mainTitle}</title>`);

    return template;
  }

  async generateMarkdown(contentData) {
    let markdown = `# ${contentData.mainTitle}\n\n`;
    markdown += `> ${contentData.subtitle}\n\n`;
    markdown += `---\n\n`;
    markdown += `**${contentData.issueNumber}**\n\n`;

    markdown += `## ${contentData.heroTitle}\n\n`;
    markdown += `${contentData.heroDescription}\n\n`;

    markdown += `---\n\n`;
    markdown += `> "${contentData.quoteText}"\n`;
    markdown += `> \n`;
    markdown += `> — ${contentData.quoteAuthor}\n\n`;

    markdown += `---\n\n`;

    for (const section of contentData.sections) {
      markdown += `## ${section.icon} ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
    }

    markdown += `---\n\n`;
    markdown += `### ${contentData.insightTitle}\n\n`;
    markdown += `${contentData.insightText}\n\n`;

    if (contentData.stats && contentData.stats.length > 0) {
      markdown += `---\n\n`;
      markdown += `### 주요 통계\n\n`;
      for (const stat of contentData.stats) {
        markdown += `- **${stat.number}**: ${stat.label}\n`;
      }
      markdown += `\n`;
    }

    if (contentData.familyTips && contentData.familyTips.length > 0) {
      markdown += `---\n\n`;
      markdown += `### 실천 팁\n\n`;
      for (const tip of contentData.familyTips) {
        markdown += `- ${tip}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
    markdown += `**P.S.**\n\n`;
    markdown += `${contentData.psText}\n`;

    return markdown;
  }
}
