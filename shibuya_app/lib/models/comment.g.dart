// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'comment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Comment _$CommentFromJson(Map<String, dynamic> json) => Comment(
  id: (json['id'] as num).toInt(),
  newsId: (json['news_id'] as num).toInt(),
  content: json['content'] as String,
  type: json['type'] as String,
  createdAt: json['created_at'] as String,
);

Map<String, dynamic> _$CommentToJson(Comment instance) => <String, dynamic>{
  'id': instance.id,
  'news_id': instance.newsId,
  'content': instance.content,
  'type': instance.type,
  'created_at': instance.createdAt,
};
