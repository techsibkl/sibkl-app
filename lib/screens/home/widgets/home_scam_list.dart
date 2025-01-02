// import "dart:convert";

// import "package:flutter/material.dart";
// import "package:flutter/services.dart";
// import "package:get/get.dart";
// import "package:sibkl_cms/controllers/theme_service_controller.dart";
// import "package:sibkl_cms/models/scam_model.dart";
// import "package:sibkl_cms/screens/home/widgets/single_scam_item.dart";
// import "package:sibkl_cms/shared/my_theme_divider.dart";

// class HomeScamList extends StatefulWidget {
//   const HomeScamList({super.key});

//   @override
//   State<HomeScamList> createState() => _HomeScamListState();
// }

// class _HomeScamListState extends State<HomeScamList> {
//   late Future<ScamsList> scamsList;

//   @override
//   void initState() {
//     super.initState();
//     scamsList = loadScams();
//   }

//   Future<ScamsList> loadScams() async {
//     final String response =
//         await rootBundle.loadString("assets/top10scams.json");
//     final data = await json.decode(response);
//     return ScamsList.fromJson(data);
//   }

//   @override
//   Widget build(BuildContext context) {
//     // final VisitorDBService _db = Get.put(VisitorDBService());
//     // final AuthService authService = Get.find();
//     final MyThemeServiceController themeService =
//         Get.put(MyThemeServiceController());

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       mainAxisSize: MainAxisSize.max,
//       children: [
//         Padding(
//           padding: EdgeInsets.symmetric(horizontal: 8),
//           child: Text(
//             "Top 10 scams",
//             style: TextStyle(
//                 fontSize: 20,
//                 fontWeight: FontWeight.bold,
//                 color: themeService.textColor87),
//           ),
//         ),
//         SizedBox(height: 10),
//         Expanded(
//           child: Card(
//             color: Theme.of(context).cardColor,
//             shape: RoundedRectangleBorder(
//               borderRadius: BorderRadius.circular(15),
//             ),
//             child: SizedBox(
//               // padding: EdgeInsets.fromLTRB(25, 30, 25, 30),
//               width: MediaQuery.of(context).size.width,
//               child: FutureBuilder(
//                 future: scamsList,
//                 builder: (context, snapshot) {
//                   if (snapshot.connectionState == ConnectionState.waiting) {
//                     return Center(
//                         child: CircularProgressIndicator(
//                             color: Theme.of(context).primaryColor));
//                   } else if (!snapshot.hasData ||
//                       snapshot.data!.scams.isEmpty) {
//                     return Center(child: Text("No scams available"));
//                   } else {
//                     return ListView.separated(
//                       padding: EdgeInsets.fromLTRB(20, 30, 20, 30),
//                       itemCount: snapshot.data!.scams.length,
//                       itemBuilder: (context, index) {
//                         final Scam scam = snapshot.data!.scams[index];
//                         return SingleScamItem(scam: scam);
//                       },
//                       separatorBuilder: (context, index) {
//                         return ThemedDivider(height: 50);
//                       },
//                     );
//                   }
//                 },
//               ),
//             ),
//           ),
//         ),
//         SizedBox(height: 10),
//       ],
//     );
//   }
// }
