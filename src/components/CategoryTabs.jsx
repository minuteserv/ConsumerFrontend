import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <Tabs value={activeCategory} onValueChange={onSelect} className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-max">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="whitespace-nowrap"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
