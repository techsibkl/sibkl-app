import { ExploreDestinationItem } from "@/config/exploreDestinations";
import { useRouter } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
	Dimensions,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

const ITEMS_PER_PAGE = 4;
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 12;

type Props = {
	destinations: ExploreDestinationItem[];
};

const chunk = <T,>(items: T[], size: number): T[][] => {
	const pages: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		pages.push(items.slice(i, i + size));
	}
	return pages;
};

const ExploreGrid = ({ destinations }: Props) => {
	const router = useRouter();
	const [pageIndex, setPageIndex] = useState(0);
	const [pageWidth, setPageWidth] = useState(
		Dimensions.get("window").width,
	);

	const pages = useMemo(
		() => chunk(destinations, ITEMS_PER_PAGE),
		[destinations],
	);

	const cardWidth =
		(pageWidth - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;

	const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const x = e.nativeEvent.contentOffset.x;
		const index = Math.round(x / pageWidth);
		setPageIndex(index);
	};

	if (destinations.length === 0) {
		return null;
	}

	return (
		<View className="mb-6">
			<View className="flex-row items-center justify-between px-4 mb-3">
				<Text className="text-xl text-black font-bold">Explore</Text>
				<Text className="text-sm text-gray-500 font-regular">
					Everything in one place
				</Text>
			</View>

			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={onScrollEnd}
				onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
				decelerationRate="fast"
			>
				{pages.map((pageItems, pageIdx) => (
					<View
						key={`page-${pageIdx}`}
						style={{ width: pageWidth }}
						className="px-4"
					>
						<View
							className="flex-row flex-wrap"
							style={{ gap: GRID_GAP }}
						>
							{pageItems.map((item) => {
								const { Icon } = item;
								return (
									<Pressable
										key={item.id}
										onPress={() => router.push(item.href)}
										style={{ width: cardWidth }}
										className="bg-white border border-border rounded-2xl px-3 py-3.5 active:opacity-80"
									>
										<View className="flex-row items-center justify-between">
											<View
												className="w-10 h-10 rounded-xl items-center justify-center"
												style={{
													backgroundColor:
														item.iconWellColor,
												}}
											>
												<Icon
													size={20}
													color={item.iconColor}
													strokeWidth={1}
												/>
											</View>
											<ChevronRightIcon
												size={18}
												color="#8E8E93"
											/>
										</View>
										<Text className="text-base font-semibold text-black mt-3">
											{item.title}
										</Text>
										<Text
											className="text-sm text-gray-500 mt-0.5"
											numberOfLines={1}
										>
											{item.subtitle}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
				))}
			</ScrollView>

			{pages.length > 1 && (
				<View className="flex-row justify-center gap-1.5 mt-3">
					{pages.map((_, idx) => (
						<View
							key={`dot-${idx}`}
							className={`h-1.5 rounded-full ${
								idx === pageIndex
									? "w-4 bg-gray-400"
									: "w-1.5 bg-gray-300"
							}`}
						/>
					))}
				</View>
			)}
		</View>
	);
};

export default ExploreGrid;
