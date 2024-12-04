import axios from 'axios';
import { DOMParser } from 'react-native-html-parser';

class SourceParser {
  constructor(source) {
    this.source = source;
    this.headers = source.header ? JSON.parse(source.header) : {};
    this.parser = new DOMParser();
  }

  // 解析HTML
  parseHTML(html) {
    return this.parser.parseFromString(html, 'text/html');
  }

  // 查找元素
  querySelector(doc, selector) {
    try {
      return doc.querySelector(selector);
    } catch (error) {
      console.error('选择器解析失败:', selector, error);
      return null;
    }
  }

  // 查找所有元素
  querySelectorAll(doc, selector) {
    try {
      return doc.querySelectorAll(selector);
    } catch (error) {
      console.error('选择器解析失败:', selector, error);
      return [];
    }
  }

  // 获取元素文本
  getText(element) {
    return element ? element.textContent.trim() : '';
  }

  // 获取元素属性
  getAttribute(element, attr) {
    return element ? element.getAttribute(attr) : '';
  }

  // 搜索书籍
  async search(keyword) {
    try {
      const searchUrl = this.source.searchUrl.replace('{{key}}', encodeURIComponent(keyword));
      const response = await axios.get(searchUrl, { headers: this.headers });
      const doc = this.parseHTML(response.data);
      
      const books = [];
      const bookList = this.querySelectorAll(doc, this.source.ruleSearch.bookList);
      
      bookList.forEach(element => {
        const book = {
          name: this.getText(this.querySelector(element, this.source.ruleSearch.name)),
          author: this.getText(this.querySelector(element, this.source.ruleSearch.author)),
          kind: this.getText(this.querySelector(element, this.source.ruleSearch.kind)),
          lastChapter: this.getText(this.querySelector(element, this.source.ruleSearch.lastChapter)),
          intro: this.getText(this.querySelector(element, this.source.ruleSearch.intro)),
          coverUrl: this.getAttribute(this.querySelector(element, this.source.ruleSearch.coverUrl), 'src'),
          bookUrl: this.getAttribute(this.querySelector(element, this.source.ruleSearch.bookUrl), 'href'),
        };
        books.push(book);
      });

      return books;
    } catch (error) {
      console.error('搜索失败:', error);
      throw error;
    }
  }

  // 获取书籍详情
  async getBookInfo(bookUrl) {
    try {
      const response = await axios.get(bookUrl, { headers: this.headers });
      const doc = this.parseHTML(response.data);

      return {
        name: this.getText(this.querySelector(doc, this.source.ruleBookInfo.name)),
        author: this.getText(this.querySelector(doc, this.source.ruleBookInfo.author)),
        kind: this.getText(this.querySelector(doc, this.source.ruleBookInfo.kind)),
        lastChapter: this.getText(this.querySelector(doc, this.source.ruleBookInfo.lastChapter)),
        intro: this.getText(this.querySelector(doc, this.source.ruleBookInfo.intro)),
        coverUrl: this.getAttribute(this.querySelector(doc, this.source.ruleBookInfo.coverUrl), 'src'),
        tocUrl: this.source.ruleBookInfo.tocUrl ? 
          this.getAttribute(this.querySelector(doc, this.source.ruleBookInfo.tocUrl), 'href') : 
          bookUrl,
      };
    } catch (error) {
      console.error('获取书籍详情失败:', error);
      throw error;
    }
  }

  // 获取目录
  async getChapterList(tocUrl) {
    try {
      const response = await axios.get(tocUrl, { headers: this.headers });
      const doc = this.parseHTML(response.data);
      
      const chapters = [];
      const chapterList = this.querySelectorAll(doc, this.source.ruleToc.chapterList);
      
      chapterList.forEach(element => {
        const chapter = {
          title: this.getText(this.querySelector(element, this.source.ruleToc.chapterName)),
          url: this.getAttribute(this.querySelector(element, this.source.ruleToc.chapterUrl), 'href'),
          isVip: this.source.ruleToc.isVip ? 
            this.querySelector(element, this.source.ruleToc.isVip) !== null : 
            false,
        };
        chapters.push(chapter);
      });

      return chapters;
    } catch (error) {
      console.error('获取目录失败:', error);
      throw error;
    }
  }

  // 获取章节内容
  async getContent(chapterUrl) {
    try {
      const response = await axios.get(chapterUrl, { headers: this.headers });
      const doc = this.parseHTML(response.data);
      
      let content = this.getText(this.querySelector(doc, this.source.ruleContent.content));
      
      // 处理正文净化规则
      if (this.source.ruleContent.replaceRegex) {
        const rules = this.source.ruleContent.replaceRegex.split('\n');
        rules.forEach(rule => {
          const [pattern, replacement] = rule.split('::');
          content = content.replace(new RegExp(pattern, 'g'), replacement || '');
        });
      }

      return content;
    } catch (error) {
      console.error('获取章节内容失败:', error);
      throw error;
    }
  }
}

export default SourceParser; 