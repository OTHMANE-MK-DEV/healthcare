"use client";

import { useEffect, useState } from "react";
import {
  CommandInput,
  // CommandItem,
  CommandList,
  // CommandGroup,
  CommandResponsiveDialog,
  CommandEmpty,
} from "@/components/ui/command";
// import { Dispatch, SetStateAction } from "react";
// import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  // setOpen: Dispatch<SetStateAction<boolean>>;
}

// interface Book {
//   id: string;
//   title: string;
//   genre: string;
//   slug: string;
// }

// interface Series {
//   id: string;
//   title: string;
//   category: string;
//   slug: string;
// }

// interface Review {
//   id: string;
//   name: string;
//   comment: string;
// }

// interface Message {
//   id: string;
//   name: string;
//   subject: string;
// }

// interface SearchResults {
//   books: Book[];
//   series: Series[];
//   reviews: Review[];
//   messages: Message[];
// }

const DashboardCommand = ({ open,  }: Props) => {
  // const navigate = useNavigate();
  const [query, setQuery] = useState("");
  // const [results, setResults] = useState<SearchResults>({
  //   books: [],
  //   series: [],
  //   reviews: [],
  //   messages: [],
  // });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // setResults({ books: [], series: [], reviews: [], messages: [] });
      setLoading(false);
      return;
    }

    if (query.trim().length < 2) {
      // setResults({ books: [], series: [], reviews: [], messages: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        // const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        // const data = await res.json();
        // setResults(data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [query, open]);

  // Fix: Properly calculate hasResults as a boolean
  // const hasResults = 
  //   results.books.length > 0 ||
  //   results.series.length > 0 ||
  //   results.reviews.length > 0 ||
  //   results.messages.length > 0;

  // console.log("Debug - Query:", query, "Query length:", query.trim().length);
  // console.log("Debug - Loading:", loading);
  // console.log("Debug - Results:", results);

  // console.log(results);


  return (
    <CommandResponsiveDialog open={open}>
      <CommandInput
        placeholder="Search books, series, reviews, messages..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && <CommandEmpty>Searching...</CommandEmpty>}

        {/* {!loading && !hasResults && query.trim().length >= 2 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Books */}
        {/* {!loading && results.books.length > 0 && (
          <CommandGroup heading="Books">
            {results.books.map((book) => (
              <CommandItem
                key={book.id}
                value={`${book.title} — ${book.genre}`}
                onSelect={() => {
                  setOpen(false);
                  navigate(`/admin/books/${book.slug}`);
                }}
              >
                {book.title} — {book.genre}
              </CommandItem>
            ))}
          </CommandGroup>
        )} */}

        {/* Series */}
        {/* {!loading && results.series.length > 0 && (
          <CommandGroup heading="Series">
            {results.series.map((serie) => (
              <CommandItem
                key={serie.id}
                value={`${serie.title} — ${serie.category}`}
                onSelect={() => {
                  setOpen(false);
                  navigate(`/admin/series/${serie.slug}`);
                }}
              >
                {serie.title} — {serie.category}
              </CommandItem>
            ))}
          </CommandGroup>
        )} */}

        {/* Reviews */}
        {/* {!loading && results.reviews.length > 0 && (
          <CommandGroup heading="Reviews">
            {results.reviews.map((review) => (
              <CommandItem
                key={review.id}
                value={`${review.name}: ${review.comment.slice(0, 40)}...`}
                onSelect={() => {
                  setOpen(false);
                  navigate(`/admin/testimonials`);
                }}
              >
                {review.name}: {review.comment.slice(0, 40)}...
              </CommandItem>
            ))}
          </CommandGroup>
        )} */}

        {/* Messages */}
        {/* {!loading && results.messages.length > 0 && (
          <CommandGroup heading="Messages">
            {results.messages.map((msg) => (
              <CommandItem
                key={msg.id}
                value={`${msg.name} — ${msg.subject}`}
                onSelect={() => {
                  setOpen(false);
                  navigate(`/admin/messages`);
                }}
              >
                {msg.name} — {msg.subject}
              </CommandItem>
            ))}
          </CommandGroup>
        )}  */}
      </CommandList>
    </CommandResponsiveDialog>
  );
};

export default DashboardCommand;