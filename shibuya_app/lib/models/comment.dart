import 'package:json_annotation/json_annotation.dart';

part 'comment.g.dart';

@JsonSerializable()
class Comment {
  final int id;
  @JsonKey(name: 'news_id')
  final int newsId;
  final String content;
  final String type;
  @JsonKey(name: 'created_at')
  final String createdAt;

  const Comment({
    required this.id,
    required this.newsId,
    required this.content,
    required this.type,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) =>
      _$CommentFromJson(json);

  Map<String, dynamic> toJson() => _$CommentToJson(this);
}
