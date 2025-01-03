class MyNotification {
  final int id;
  final String title;
  final String img;
  final String description;
  final String longDescription;
  final String aiIdentity;
  final String exampleInput;
  final String exampleModel;
  final int count;
  final List<String> identify;

  MyNotification({
    required this.id,
    required this.title,
    required this.img,
    required this.description,
    required this.longDescription,
    required this.aiIdentity,
    required this.exampleInput,
    required this.exampleModel,
    required this.count,
    required this.identify,
  });

  factory MyNotification.fromJson(Map<String, dynamic> json) {
    return MyNotification(
      id: json["id"] as int,
      title: json["title"] as String,
      img: json["img"] as String,
      description: json["description"] as String,
      longDescription: json["longDescription"] as String,
      aiIdentity: (json["aiIdentity"] ?? "") as String,
      exampleInput: (json["exampleInput"] ?? "") as String,
      exampleModel: (json["exampleModel"] ?? "") as String,
      count: json["count"] as int,
      identify: List<String>.from(json["identify"]),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "title": title,
      "img": img,
      "description": description,
      "longDescription": longDescription,
      "aiIdentity": aiIdentity,
      "exampleInput": exampleInput,
      "exampleModel": exampleModel,
      "count": count,
      "identify": identify,
    };
  }
}

class NotificationsList {
  final List<MyNotification> notifications;

  NotificationsList({required this.notifications});

  factory NotificationsList.fromJson(Map<String, dynamic> json) {
    return NotificationsList(
      notifications: (json["notifications"] as List).map((i) => MyNotification.fromJson(i)).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "notifications": notifications.map((notification) => notification.toJson()).toList(),
    };
  }
}
