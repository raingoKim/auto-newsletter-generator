import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { NewsletterGenerator } from './generator.js';
import { StorageManager } from './storage.js';

const BANNER = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        📰 Auto Newsletter Generator 📰                    ║
║                                                           ║
║        뉴스레터 자동 생성 도구                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

async function main() {
  console.clear();
  console.log(chalk.cyan(BANNER));

  try {
    // 사용자 입력 받기
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Anthropic API Key를 입력하세요:',
        default: process.env.ANTHROPIC_API_KEY,
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API Key는 필수입니다!';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'topic',
        message: '뉴스레터 주제를 입력하세요:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return '주제는 필수입니다!';
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'saveToObsidian',
        message: '옵시디언 볼트에도 저장하시겠습니까?',
        default: true
      },
      {
        type: 'input',
        name: 'obsidianFolder',
        message: '옵시디언 폴더명을 입력하세요:',
        default: 'Newsletter',
        when: (answers) => answers.saveToObsidian,
        validate: (input) => {
          if (!input || input.trim() === '') {
            return '폴더명은 필수입니다!';
          }
          return true;
        }
      }
    ]);

    console.log('\n' + chalk.yellow('━'.repeat(60)));

    // 뉴스레터 생성기 초기화
    const generator = new NewsletterGenerator(answers.apiKey);
    const storage = new StorageManager();

    // 1단계: 콘텐츠 생성
    const spinner1 = ora(chalk.blue('AI가 뉴스레터 콘텐츠를 생성하고 있습니다...')).start();

    let contentData;
    try {
      contentData = await generator.generateContent(answers.topic);
      spinner1.succeed(chalk.green('✓ 콘텐츠 생성 완료!'));
    } catch (error) {
      spinner1.fail(chalk.red('✗ 콘텐츠 생성 실패'));
      throw error;
    }

    // 2단계: HTML 생성
    const spinner2 = ora(chalk.blue('HTML 뉴스레터를 생성하고 있습니다...')).start();

    let htmlContent;
    try {
      htmlContent = await generator.generateHTML(contentData);
      spinner2.succeed(chalk.green('✓ HTML 생성 완료!'));
    } catch (error) {
      spinner2.fail(chalk.red('✗ HTML 생성 실패'));
      throw error;
    }

    // 3단계: 마크다운 생성
    const spinner3 = ora(chalk.blue('마크다운 문서를 생성하고 있습니다...')).start();

    let markdownContent;
    try {
      markdownContent = await generator.generateMarkdown(contentData);
      spinner3.succeed(chalk.green('✓ 마크다운 생성 완료!'));
    } catch (error) {
      spinner3.fail(chalk.red('✗ 마크다운 생성 실패'));
      throw error;
    }

    // 4단계: 로컬 저장
    const spinner4 = ora(chalk.blue('로컬에 파일을 저장하고 있습니다...')).start();

    try {
      await storage.saveToLocal(answers.topic, htmlContent, markdownContent);
      spinner4.succeed(chalk.green('✓ 로컬 저장 완료!'));
    } catch (error) {
      spinner4.fail(chalk.red('✗ 로컬 저장 실패'));
      throw error;
    }

    // 5단계: 옵시디언 저장 (선택사항)
    if (answers.saveToObsidian) {
      const spinner5 = ora(chalk.blue('옵시디언 볼트에 저장하고 있습니다...')).start();

      try {
        await storage.saveToObsidian(answers.obsidianFolder, answers.topic, markdownContent);
        spinner5.succeed(chalk.green('✓ 옵시디언 저장 완료!'));
      } catch (error) {
        spinner5.fail(chalk.red('✗ 옵시디언 저장 실패'));
        throw error;
      }
    }

    console.log('\n' + chalk.yellow('━'.repeat(60)));
    console.log(chalk.green.bold('\n🎉 뉴스레터 생성이 완료되었습니다!\n'));

    // 결과 요약
    console.log(chalk.cyan('📊 생성 결과 요약:'));
    console.log(chalk.white(`   주제: ${contentData.mainTitle}`));
    console.log(chalk.white(`   섹션 수: ${contentData.sections.length}개`));
    console.log(chalk.white(`   저장 위치:`));
    console.log(chalk.white(`     - 로컬: News Completion 폴더`));
    if (answers.saveToObsidian) {
      console.log(chalk.white(`     - 옵시디언: ${answers.obsidianFolder} 폴더`));
    }
    console.log('\n' + chalk.yellow('━'.repeat(60)) + '\n');

  } catch (error) {
    console.error(chalk.red('\n❌ 오류가 발생했습니다:'), error.message);
    process.exit(1);
  }
}

main();
