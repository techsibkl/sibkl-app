import { Person } from "@/services/Person/person.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import EmptyList from "../Cells/EmptyList";
import PeopleRow from "./PeopleRow";

type PeopleListProps = {
  people: Person[];
};

const PeopleList = ({ people }: PeopleListProps) => {
  const renderItem = ({ item }: { item: Person }) => (
    <PeopleRow person={item} />
  );

  return (
    <FlashList
      data={people}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<EmptyList />}
      estimatedItemSize={100}
      removeClippedSubviews
    />
  );
};

export default PeopleList;
