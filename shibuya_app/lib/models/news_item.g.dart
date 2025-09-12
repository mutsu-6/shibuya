// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'news_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

NewsItem _$NewsItemFromJson(Map<String, dynamic> json) => NewsItem(
  id: (json['id'] as num).toInt(),
  title: json['title'] as String,
  content: json['content'] as String,
  url: json['url'] as String,
  createdAt: json['created_at'] as String,
  summaryShort: json['summary_short'] as String?,
  summaryLong: json['summary_long'] as String?,
  summaryEasy: json['summary_easy'] as String?,
);

Map<String, dynamic> _$NewsItemToJson(NewsItem instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'content': instance.content,
  'url': instance.url,
  'created_at': instance.createdAt,
  'summary_short': instance.summaryShort,
  'summary_long': instance.summaryLong,
  'summary_easy': instance.summaryEasy,
};
