import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'services/api_client.dart';
import 'screens/home_screen.dart';
import 'screens/news_screen.dart';
import 'screens/comments_screen.dart';
import 'screens/communities_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const ShibuyaApp());
}

class ShibuyaApp extends StatelessWidget {
  const ShibuyaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>(
          create: (_) => ApiClient(),
          dispose: (_, apiClient) => apiClient.dispose(),
        ),
      ],
      child: MaterialApp.router(
        title: '渋谷共創ダッシュボード',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2563EB), // Blue-600
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          fontFamily: 'NotoSansJP',
        ),
        routerConfig: _router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

final GoRouter _router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return MainLayout(child: child);
      },
      routes: [
        GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
        GoRoute(path: '/news', builder: (context, state) => const NewsScreen()),
        GoRoute(
          path: '/comments',
          builder: (context, state) => const CommentsScreen(),
        ),
        GoRoute(
          path: '/communities',
          builder: (context, state) => const CommunitiesScreen(),
        ),
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
      ],
    ),
  ],
);

class MainLayout extends StatefulWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  final List<NavigationItem> _navigationItems = [
    NavigationItem(icon: Icons.home, label: 'ホーム', path: '/'),
    NavigationItem(icon: Icons.article, label: 'ニュース', path: '/news'),
    NavigationItem(icon: Icons.comment, label: 'コメント', path: '/comments'),
    NavigationItem(icon: Icons.people, label: 'コミュニティ', path: '/communities'),
    NavigationItem(icon: Icons.dashboard, label: 'ダッシュボード', path: '/dashboard'),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    context.go(_navigationItems[index].path);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '渋谷共創ダッシュボード',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        elevation: 0,
      ),
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).colorScheme.onSurfaceVariant,
        items: _navigationItems
            .map(
              (item) => BottomNavigationBarItem(
                icon: Icon(item.icon),
                label: item.label,
              ),
            )
            .toList(),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final String label;
  final String path;

  NavigationItem({required this.icon, required this.label, required this.path});
}
