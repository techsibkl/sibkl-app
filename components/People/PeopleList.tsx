import { FlashList } from '@shopify/flash-list'
import React from 'react'
import EmptyList from '../Cells/EmptyList'
import PeopleRow from './PeopleRow'

type PeopleListProps = {
    people: any[]
}

const PeopleList = ({people} : PeopleListProps) => {
  return (
    <FlashList
      data={people}
      renderItem={({ item: person }) => <PeopleRow person={person} />}
      ListEmptyComponent={<EmptyList />}
      estimatedItemSize={100}
    />
  )
}

export default PeopleList