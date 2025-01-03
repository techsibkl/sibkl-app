import "package:flutter/material.dart";
import "package:sibkl_cms/screens/home/widgets/home_appbar.dart";
import "package:sibkl_cms/screens/home/widgets/home_notification_list.dart";
import "package:sibkl_cms/screens/home/widgets/home_summary_card.dart";

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(22, 32, 22, 32),
      child: Column(
        children: [
          Padding(
              padding: EdgeInsets.symmetric(horizontal: 5),
              child: HomeAppBar()),
          SizedBox(height: 20),
          HomeSummaryCard(),
          SizedBox(height: 30),
          Expanded(child: HomeNotificationList()),
        ],
      ),
    );
  }
}
