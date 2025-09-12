// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DashboardSummary _$DashboardSummaryFromJson(Map<String, dynamic> json) =>
    DashboardSummary(
      totalNews: (json['total_news'] as num).toInt(),
      totalComments: (json['total_comments'] as num).toInt(),
      totalCommunities: (json['total_communities'] as num).toInt(),
      totalKpis: (json['total_kpis'] as num).toInt(),
    );

Map<String, dynamic> _$DashboardSummaryToJson(DashboardSummary instance) =>
    <String, dynamic>{
      'total_news': instance.totalNews,
      'total_comments': instance.totalComments,
      'total_communities': instance.totalCommunities,
      'total_kpis': instance.totalKpis,
    };
