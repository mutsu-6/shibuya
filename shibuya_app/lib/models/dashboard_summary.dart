import 'package:json_annotation/json_annotation.dart';

part 'dashboard_summary.g.dart';

@JsonSerializable()
class DashboardSummary {
  @JsonKey(name: 'total_news')
  final int totalNews;
  @JsonKey(name: 'total_comments')
  final int totalComments;
  @JsonKey(name: 'total_communities')
  final int totalCommunities;
  @JsonKey(name: 'total_kpis')
  final int totalKpis;

  const DashboardSummary({
    required this.totalNews,
    required this.totalComments,
    required this.totalCommunities,
    required this.totalKpis,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) =>
      _$DashboardSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$DashboardSummaryToJson(this);
}
