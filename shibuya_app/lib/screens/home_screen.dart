import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../services/api_client.dart';
import '../models/dashboard_summary.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  DashboardSummary? _summary;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardSummary();
  }

  Future<void> _loadDashboardSummary() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final apiClient = context.read<ApiClient>();
      final summary = await apiClient.getDashboardSummary();

      setState(() {
        _summary = summary;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadDashboardSummary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ウェルカムセクション
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'おかえりなさい！',
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '渋谷区の共創活動の最新状況をご覧ください',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // サマリーカード
              if (_isLoading)
                const Center(
                  child: SpinKitFadingCircle(color: Colors.blue, size: 50.0),
                )
              else if (_error != null)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 48,
                          color: Theme.of(context).colorScheme.error,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'データの読み込みに失敗しました',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _error!,
                          style: Theme.of(context).textTheme.bodySmall,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadDashboardSummary,
                          child: const Text('再試行'),
                        ),
                      ],
                    ),
                  ),
                )
              else if (_summary != null)
                _buildSummaryCards(_summary!),

              const SizedBox(height: 24),

              // アクションボタン
              Text(
                'クイックアクション',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCards(DashboardSummary summary) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '活動サマリー',
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.2,
          children: [
            _buildSummaryCard(
              title: 'ニュース',
              count: summary.totalNews,
              icon: Icons.article,
              color: Colors.blue,
            ),
            _buildSummaryCard(
              title: 'コメント',
              count: summary.totalComments,
              icon: Icons.comment,
              color: Colors.green,
            ),
            _buildSummaryCard(
              title: 'コミュニティ',
              count: summary.totalCommunities,
              icon: Icons.people,
              color: Colors.orange,
            ),
            _buildSummaryCard(
              title: 'KPI',
              count: summary.totalKpis,
              icon: Icons.dashboard,
              color: Colors.purple,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard({
    required String title,
    required int count,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              count.toString(),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  // ニュース収集機能
                  _scrapeNews();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('ニュース収集'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // KPI生成機能
                  _generateKPIs();
                },
                icon: const Icon(Icons.analytics),
                label: const Text('KPI生成'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ],
    );
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

      // サマリーを更新
      _loadDashboardSummary();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('ニュース収集に失敗しました: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _generateKPIs() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('KPI生成機能は準備中です'),
        backgroundColor: Colors.orange,
      ),
    );
  }
}
