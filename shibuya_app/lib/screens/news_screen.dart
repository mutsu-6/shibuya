import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../services/api_client.dart';
import '../models/news_item.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  List<NewsItem> _news = [];
  bool _isLoading = true;
  String? _error;
  final RefreshController _refreshController = RefreshController(
    initialRefresh: false,
  );

  @override
  void initState() {
    super.initState();
    _loadNews();
  }

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }

  Future<void> _loadNews() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final apiClient = context.read<ApiClient>();
      final news = await apiClient.getNews();

      setState(() {
        _news = news;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _onRefresh() async {
    await _loadNews();
    _refreshController.refreshCompleted();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SmartRefresher(
        controller: _refreshController,
        onRefresh: _onRefresh,
        child: _buildBody(),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _scrapeNews,
        tooltip: 'ニュース収集',
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: SpinKitFadingCircle(color: Colors.blue, size: 50.0),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'ニュースの読み込みに失敗しました',
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _loadNews, child: const Text('再試行')),
            ],
          ),
        ),
      );
    }

    if (_news.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.article_outlined,
                size: 64,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(height: 16),
              Text('ニュースがありません', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(
                'ニュース収集ボタンを押して最新ニュースを取得してください',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _scrapeNews,
                icon: const Icon(Icons.refresh),
                label: const Text('ニュース収集'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: _news.length,
      itemBuilder: (context, index) {
        final newsItem = _news[index];
        return _buildNewsCard(newsItem);
      },
    );
  }

  Widget _buildNewsCard(NewsItem newsItem) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      child: InkWell(
        onTap: () => _showNewsDetail(newsItem),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                newsItem.title,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              if (newsItem.summaryShort != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    newsItem.summaryShort!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
              const SizedBox(height: 8),
              Text(
                newsItem.content,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _formatDate(newsItem.createdAt),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => _showComments(newsItem),
                        icon: const Icon(Icons.comment_outlined),
                        iconSize: 20,
                      ),
                      IconButton(
                        onPressed: () => _shareNews(newsItem),
                        icon: const Icon(Icons.share_outlined),
                        iconSize: 20,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showNewsDetail(NewsItem newsItem) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            controller: scrollController,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        newsItem.title,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  _formatDate(newsItem.createdAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                if (newsItem.summaryLong != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceVariant,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      newsItem.summaryLong!,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                Text(
                  newsItem.content,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _showComments(newsItem);
                        },
                        icon: const Icon(Icons.comment),
                        label: const Text('コメント'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _shareNews(newsItem),
                        icon: const Icon(Icons.share),
                        label: const Text('共有'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showComments(NewsItem newsItem) {
    // コメント画面への遷移（実装予定）
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('コメント機能は準備中です')));
  }

  void _shareNews(NewsItem newsItem) {
    // 共有機能（実装予定）
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('共有機能は準備中です')));
  }

  Future<void> _scrapeNews() async {
    try {
      final apiClient = context.read<ApiClient>();
      await apiClient.scrapeNews();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ニュース収集を開始しました'),
          backgroundColor: Colors.green,
        ),
      );

      // ニュースリストを更新
      await _loadNews();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('ニュース収集に失敗しました: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 0) {
        return '${difference.inDays}日前';
      } else if (difference.inHours > 0) {
        return '${difference.inHours}時間前';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes}分前';
      } else {
        return 'たった今';
      }
    } catch (e) {
      return dateString;
    }
  }
}
