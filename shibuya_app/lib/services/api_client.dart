import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/news_item.dart';
import '../models/comment.dart';
import '../models/dashboard_summary.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:8000';

  final http.Client _client = http.Client();

  // ニュース関連API
  Future<List<NewsItem>> getNews() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/news'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> newsData = data['news'] ?? [];
        return newsData.map((json) => NewsItem.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load news: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching news: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> scrapeNews() async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/scrape-news'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to scrape news: ${response.statusCode}');
      }
    } catch (e) {
      print('Error scraping news: $e');
      rethrow;
    }
  }

  // コメント関連API
  Future<List<Comment>> getComments({int? newsId}) async {
    try {
      String url = '$baseUrl/comments';
      if (newsId != null) {
        url += '?news_id=$newsId';
      }

      final response = await _client.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> commentsData = data['comments'] ?? [];
        return commentsData.map((json) => Comment.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load comments: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching comments: $e');
      return [];
    }
  }

  Future<Comment> createComment({
    required int newsId,
    required String content,
    required String type,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/comments'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'news_id': newsId,
          'content': content,
          'type': type,
        }),
      );

      if (response.statusCode == 200) {
        return Comment.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create comment: ${response.statusCode}');
      }
    } catch (e) {
      print('Error creating comment: $e');
      rethrow;
    }
  }

  // ダッシュボード関連API
  Future<DashboardSummary> getDashboardSummary() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/dashboard/summary'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return DashboardSummary.fromJson(json.decode(response.body));
      } else {
        throw Exception(
          'Failed to load dashboard summary: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('Error fetching dashboard summary: $e');
      rethrow;
    }
  }

  // リソースのクリーンアップ
  void dispose() {
    _client.close();
  }
}
