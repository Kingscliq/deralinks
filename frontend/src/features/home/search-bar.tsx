import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <Box className="relative w-full max-w-md">
      <Input
        type="search"
        placeholder="Search by location, property type, or keyword"
        className="pr-12 bg-card/80 border-border/50 text-white placeholder:text-slate-400 focus:border-primary/50"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1 -translate-y-1/2 text-slate-400 hover:text-primary"
      >
        <Search className="h-5 w-5" />
        <Box as="span" className="sr-only">
          Search
        </Box>
      </Button>
    </Box>
  );
}
