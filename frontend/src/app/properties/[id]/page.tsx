import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/header';

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params; // Property ID for dynamic routing

  return (
    <Box className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 md:py-24">
        <Box className="container mx-auto px-4 md:px-6">
          <Box className="grid md:grid-cols-2 gap-8">
            <Box>
              <Box
                as="img"
                src="/placeholder.svg"
                alt="Property Image"
                width={800}
                height={450}
                className="rounded-lg object-cover w-full aspect-video"
              />
            </Box>
            <Box className="grid gap-4">
              <Box>
                <Badge>For Sale</Badge>
              </Box>
              <Box as="h1" className="font-bold text-3xl">
                Property #{id} - Modern Apartment in Downtown
              </Box>
              <Box as="p" className="text-muted-foreground">
                2 beds | 2 baths | 1,200 sqft
              </Box>
              <Box className="font-semibold text-4xl">500,000 HBAR</Box>
              <Box as="p" className="text-muted-foreground">
                $417/sqft
              </Box>
              <Button size="lg">Purchase Tokens</Button>
            </Box>
          </Box>
          <Box className="mt-12">
            <Box as="h2" className="font-bold text-2xl mb-4">
              About this property
            </Box>
            <Box as="p" className="text-muted-foreground">
              This stunning modern apartment in the heart of downtown offers breathtaking city views
              and luxurious amenities. The open-concept living space is perfect for entertaining,
              and the spacious bedrooms provide a peaceful retreat. With a prime location just steps
              from shops, restaurants, and public transportation, this property is an exceptional
              investment opportunity.
            </Box>
          </Box>
        </Box>
      </main>
    </Box>
  );
}
