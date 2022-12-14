import {
  articleModel, ArticleModel, ArticleData, ArticleInfo,
} from '../db/models/article-model';
import { commentModel, CommentData } from '../db/models/comment-model';
import { userService } from './user-service';
import { articleValidation } from '../utils/validation-article';

interface searchCondition {
  articleType: string;
  filter: string;
  page: number;
  perPage: number;
}
interface userIdSearchCondition {
  userId: string;
  page: number;
  perPage: number;
}
interface authorSearchCondition extends searchCondition {
  author: string;
}

interface titleSearchCondition extends searchCondition {
  title: string;
}
interface commentSearchCondition {
  articleId: string;
  page: number;
  perPage: number;
}

class ArticleService {
  articleModel: ArticleModel;

  constructor(articleModel: ArticleModel) {
    this.articleModel = articleModel;
  }

  // 1. 새 게시글 작성
  async createArticle(userId: string, articleInfo: ArticleInfo): Promise<ArticleData | any> {
    // 기본 validation
    await articleValidation.createArticle(articleInfo);
    const result = await this.articleModel.createArticle(articleInfo);
    // 유저 당근 개수 조정
    // eslint-disable-next-line max-len
    if (articleInfo.carrots) {
      await userService.manageCarrots(userId, { $inc: { carrots: -articleInfo.carrots } });
    }
    return result;
  }

  // 2. 전체 게시글 조회 - 최신순, 페이지네이션
  // eslint-disable-next-line max-len
  async findArticles(searchCondition: searchCondition): Promise<[articleList: ArticleData[], total: number ]> {
    // eslint-disable-next-line max-len
    const {
      articleType, filter, page, perPage,
    } = searchCondition;
    // eslint-disable-next-line max-len
    const [articleList, totalPage] = await this.articleModel.findArticles(articleType, filter, page, perPage);
    return [articleList, totalPage];
  }

  // 3-0. 게시글 조회 - 내부용
  async findArticleOne(articleId: string): Promise<ArticleData | null> {
    const article = await this.articleModel.findArticle(articleId);
    return article;
  }

  // 3-1. 게시글 조회 - view 반환
  async findArticle(articleId: string)
  : Promise<Partial<ArticleData>> {
    // 게시글 정보
    const articleInfo = await this.articleModel.findArticle(articleId);
    // 게시글에 있는 댓글 정보
    const { views } = articleInfo;
    return { views };
  }

  // 3-2. 게시글 조회 - 게시글 아이디 - 원본
  async findArticleViews(commentSearchCondition: commentSearchCondition)
    : Promise<[
      articleInfo: ArticleData | null,
      commentList: CommentData[] | null,
      totalPage: number]> {
    const { articleId, page, perPage } = commentSearchCondition;
    // 게시글 정보
    const articleInfo = await this.articleModel.findArticleViews(articleId);
    // 게시글에 있는 댓글 정보
    const [commentList, totalPage] = await commentModel.findByArticleId(articleId, page, perPage);
    return [articleInfo, commentList, totalPage];
  }

  // 4. 게시글 제목, 내용 수정
  async updateArticle(userId: string, updateInfo: any): Promise<ArticleData | null> {
    // validation
    await articleValidation.updateArticle(userId, updateInfo);
    const updatedResult = await this.articleModel.updateArticle(updateInfo);
    return updatedResult;
  }

  // 5. 게시글 삭제
  async deleteArticle(userId: string, articleId: string): Promise<ArticleData | null> {
    // validation - 유저 아이디, 댓글 여부
    await articleValidation.deleteArticle(userId, articleId);
    // 삭제할 게시글 전용 collection으로 이동
    // 해당 게시글 삭제
    const result = await this.articleModel.deleteArticle(articleId);
    // 삭제할 댓글 전용 collection으로 이동
    // 관련 댓글 삭제
    await commentModel.deleteByArticleId(articleId);
    return result;
  }

  // 6. 게시글 좋아요
  async likeArticle(articleType: string, userId: string, articleId: string): Promise<any | null> {
    const result = await articleModel.likeArticle(articleId, userId);
    return result;
  }

  // 7. 게시글 검색 - 작성자
  async searchArticlesByAuthor(authorSearchCondition: authorSearchCondition)
  : Promise<[articleList: ArticleData[] | null, total: number]> {
    const {
      author, articleType, filter, page, perPage,
    } = authorSearchCondition;
    const [articleList, totalPage] = await this.articleModel
      .searchArticlesByAuthor(author, articleType, filter, page, perPage);
    return [articleList, totalPage];
  }

  // 8. 게시글 검색 - 글 제목
  async searchArticlesByTitle(titleSearchCondition: titleSearchCondition)
  : Promise<[articleList: ArticleData[] | null, total: number]> {
    const {
      title, articleType, filter, page, perPage,
    } = titleSearchCondition;
    const [articleList, totalPage] = await this.articleModel
      .searchArticlesByTitle(title, articleType, filter, page, perPage);
    return [articleList, totalPage];
  }

  // 9. 게시글 삭제 - 관리자
  // eslint-disable-next-line max-len
  async deleteArticleForAdmin(articleId: string): Promise<ArticleData | null> {
    // 해당 게시글 삭제
    const result = await this.articleModel.deleteArticle(articleId);
    // 삭제할 댓글 전용 collection으로 이동
    // 관련 댓글 삭제
    await commentModel.deleteByArticleId(articleId);
    return result;
  }

  // 10 마이페이지 - 게시글 조회
  // eslint-disable-next-line max-len
  async findProjectById(searchCondition: userIdSearchCondition): Promise<[articleList: ArticleData[] | null, total: number | null ]> {
    // eslint-disable-next-line max-len
    const {
      userId, page, perPage,
    } = searchCondition;
      // eslint-disable-next-line max-len
    const [projectList, totalPage] = await this.articleModel.findProjectById(userId, page, perPage);
    return [projectList, totalPage];
  }

  // 11. 게시글 댓글 추가
  async commentArticle(commentId: string, articleId: string): Promise<ArticleData | null> {
    const result = await this.articleModel.commentArticle(commentId, articleId);
    return result;
  }

  // 12. 게시글 댓글 삭제
  async pullComment(commentId: string, articleId: string): Promise<ArticleData | null> {
    const result = await this.articleModel.pullComment(commentId, articleId);
    return result;
  }
}

export const articleService = new ArticleService(articleModel);
