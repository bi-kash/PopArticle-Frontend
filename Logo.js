import { Text, Box } from "@chakra-ui/layout"
import Link from "next/link"
import config from "@/contents/site-settings.json"

export default function Logo() {
  // Prepare text and colors, splitting words into two lines
  const logoText = config.logo_text || config.site_title || "Site Logo"

  // split into individual words (ignore extra spaces)
  const words = logoText.split(" ").filter(Boolean)

  // top line should contain first two words (or fewer)
  const topWords = words.length <= 2 ? words : words.slice(0, 2)
  const bottomWords = words.length <= 2 ? [] : words.slice(2)

  // allow overriding the color palette from config.legendary later
  const palette =
    Array.isArray(config.logo_colors) && config.logo_colors.length > 0
      ? config.logo_colors
      : [
          "brand.primary",
          "brand.secondary",
          "brand.accent",
          "brand.ink",
          "brand.gray",
        ]
  const getColor = index => palette[index % palette.length]

  const renderLine = (wordArray, isBottom) =>
    wordArray.map((word, idx) => (
      <Text
        as="span"
        key={idx}
        fontWeight={isBottom ? "900" : "500"}
        fontStyle={isBottom ? "normal" : "italic"}
        color={getColor(idx)}
      >
        {word}
        {idx !== wordArray.length - 1 ? " " : ""}
      </Text>
    ))

  return (
    <Box
      as={Link}
      href="/"
      display="flex"
      flexDirection="column"
      color="black"
      fontSize="1.25rem"
      _hover={{ color: "blue.900" }}
      fontFamily="montserrat, system-ui, open-sans, sans-serif"
      lineHeight={1}
      position="relative"
    >
      <Text as="span" display="block">
        {renderLine(topWords, false)}
      </Text>
      {bottomWords.length > 0 && (
        <Text as="span" display="block" mt="-3">
          {renderLine(bottomWords, true)}
        </Text>
      )}
    </Box>
  )
}
