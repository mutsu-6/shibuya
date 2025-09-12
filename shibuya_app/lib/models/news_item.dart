import 'package:json_annotation/json_annotation.dart';

part 'news_item.g.dart';

@JsonSerializable()
class NewsItem {
  final int id;
  final String title;
  final String content;
  final String url;
  @JsonKey(name: 'created_at')
  final String createdAt;
  @JsonKey(name: 'summary_short')
  final String? summaryShort;
  @JsonKey(name: 'summary_long')
  final String? summaryLong;
  @JsonKey(name: 'summary_easy')
  final String? summaryEasy;

  const NewsItem({
    required this.id,
    required this.title,
    required this.content,
    required this.url,
    required this.createdAt,
    this.summaryShort,
    this.summaryLong,
    this.summaryEasy,
  });

  factory NewsItem.fromJson(Map<String, dynamic> json) =>
      _$NewsItemFromJson(json);

  Map<String, dynamic> toJson() => _$NewsItemToJson(this);
}
