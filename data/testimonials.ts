/**
 * Real customer reviews, transcribed verbatim from Fred's Plumbing's public
 * Google Business Profile on 28 July 2026.
 *
 * As of the reviews phase these constants are the FALLBACK: the site reads via
 * `getTestimonials()` in `sanity/lib/getTestimonials.ts`, which pulls the
 * `testimonial` documents from Sanity and only drops back here if the fetch
 * throws.
 *
 * RULES FOR THIS FILE
 * - Every entry must be a real review that exists on the Google listing.
 *   Never invent, paraphrase, "clean up", or extend a quote — Google's terms
 *   require reviews be shown as written, and an invented quote is a legal and
 *   reputational problem, not a copy problem.
 * - `date` is the human-readable month Google's relative timestamp resolved to
 *   on the transcription date ("a week ago" → July 2026, anchored 2026-07-28).
 * - Reviewer profile photos are deliberately NOT stored or hotlinked; Google
 *   restricts caching them. `TestimonialCard` renders an initial circle.
 * - `serviceTags` drive which reviews surface on which service / property-type
 *   page. Values must match a real slug in `data/services.ts` or
 *   `data/industries.ts` — an unknown tag silently shows the review nowhere.
 */

/** Where a review came from. Only Google is wired today. */
export type TestimonialSource = "google" | "direct";

export interface Testimonial {
  /** Stable key — reviewer slug + month. Used as the React key. */
  id: string;
  name: string;
  role?: string;
  rating: number;
  quote: string;
  date: string;
  featured?: boolean;
  /** Provenance — "google" renders the "Posted on Google" attribution line. */
  source: TestimonialSource;
  /** Deep link to the review platform. Falls back to the listing URL. */
  sourceUrl?: string;
  /** Reviewer standing on Google, e.g. "Local Guide · 32 reviews". */
  reviewerMeta?: string;
  /**
   * Service and property-type slugs this review is relevant to.
   * See `REVIEW_TAGS` in `data/googleReviews.ts` for the allow-list.
   */
  serviceTags?: string[];
}

export const testimonials: Testimonial[] = [
  {
    id: "john-hamm-2026-07",
    name: "John Hamm",
    rating: 5,
    quote:
      "As always, I can depend on the team at Fred's Plumbing to respond quickly and complete the job professionally! Fred Gray was onsite to prepare a bid, and on finding a few units on the verge of failure, called in reinforcements and got FIVE emergency repairs done after a full morning walking units! I cannot recommend Fred's Plumbing enough!",
    date: "July 2026",
    featured: true,
    source: "google",
    reviewerMeta: "4 reviews",
    serviceTags: [
      "emergency-plumbing",
      "commercial-plumbing",
      "plumbing",
      "apartments",
    ],
  },
  {
    id: "sergio-0206-2026-05",
    name: "Sergio 0206",
    rating: 5,
    quote:
      "May 25, 2026. Excellent work from David Sikes & Jeremy May this Memorial Day! These two experts repaired a main water line to the high rise building I work at in downtown Dallas. A resident drilled a hole into the water line by accident in an attempt to hang a mirror & flooded his bedroom before I could shut off the water. David & Jeremy preformed the repair & inspected the repair with the water turned back on at full pressure with 0 leaks. Thanks to the expertise of these two gentlemen, the water was turned back on for all residents in a timely manner. David, Jeremy, & Fred's have my gratitude.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "3 reviews · 4 photos",
    serviceTags: [
      "emergency-plumbing",
      "commercial-plumbing",
      "plumbing",
      "condos",
    ],
  },
  {
    id: "bailey-beckett-2026-07",
    name: "Bailey Beckett",
    rating: 5,
    quote:
      "Jeremy and Scott came out for an emergency plumbing issue and were extremely quick to find and resolve the issue. Great communication! Hands down would recommend them for any plumbing job you have!",
    date: "July 2026",
    source: "google",
    reviewerMeta: "Local Guide · 32 reviews · 4 photos",
    serviceTags: ["emergency-plumbing", "plumbing"],
  },
  {
    id: "jesus-umanzor-2026-05",
    name: "Jesus Umanzor",
    rating: 5,
    quote:
      "Jeremy May with Fred's Plumbing was outstanding from start to finish. We had a clogged toilet issue, and he quickly diagnosed the problem and accessed the pipe through the wall above the toilet to get everything cleared properly. He explained the process, worked efficiently, cleaned up after himself, and made sure everything was working before leaving. Great customer service, professional attitude, and quality work. Definitely recommend Jeremy May and Fred's Plumbing!",
    date: "May 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    serviceTags: ["drain-sewer", "plumbing"],
  },
  {
    id: "tim-barnes-2026-06",
    name: "Tim Barnes",
    rating: 5,
    quote:
      "Scott was fantastic, very knowledgeable, took care of us quickly and respected tenants as well our area, cleaned up. Would definitely request his services!!!",
    date: "June 2026",
    source: "google",
    reviewerMeta: "Local Guide · 12 reviews",
    serviceTags: ["plumbing", "commercial-plumbing", "apartments"],
  },
  {
    id: "elizabeth-scalf-2026-05",
    name: "Elizabeth Scalf",
    rating: 5,
    quote:
      "David C. came out to my apartment within day and fixed a leaking pipe from a unit above me that was dripping into my apartment. He had to go up and down stairs the whole time but did not complain. He explained what that he would be coming and in out and was very nice and courteous when doing so. At the end, he took the time to explain what he fixed.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "1 review",
    serviceTags: ["plumbing", "emergency-plumbing", "apartments"],
  },
  {
    id: "sil-0001silver-2026-05",
    name: "sil 0001silver",
    rating: 5,
    quote:
      "Scott did an amazing job and was so courteous! Fixed my shower and tub spouts pretty quickly! We know we're in good hands! Thank you so much!",
    date: "May 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    serviceTags: ["plumbing", "apartments"],
  },
  {
    id: "jennifer-alford-2026-05",
    name: "Jennifer Alford",
    rating: 5,
    quote:
      "Scott and David C. are awesome. Always respectfully, kind, and courteous! Thank you so much for always taking care of me.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "1 review",
    serviceTags: ["plumbing", "maintenance"],
  },
  {
    id: "ashley-guapacha-2025-12",
    name: "Ashley Guapacha",
    rating: 5,
    quote:
      "Fred saved us and found a bad and unexpected leak. William came out for our emergency. Thank you for the amazing service. Jordan was so kind while we panicked. Thanks yall. Highly recommend",
    date: "December 2025",
    source: "google",
    reviewerMeta: "5 reviews · 6 photos",
    serviceTags: ["emergency-plumbing", "plumbing"],
  },
  {
    id: "moises-plata-2026-04",
    name: "moises plata",
    rating: 5,
    quote:
      "Fred G. Is very friendly and very, very knowledgeable he knows his job and performed it very well every single time I have been contracting Fred's plumbing for almost a decade now and all the techs are top notch",
    date: "April 2026",
    source: "google",
    reviewerMeta: "Local Guide · 74 reviews · 5 photos",
    serviceTags: ["commercial-plumbing", "maintenance"],
  },
  {
    id: "martin-martinez-2026-03",
    name: "Martin Martinez",
    rating: 5,
    quote:
      "David L did an outstanding job! He was very courteous and professional as well as prompt and we were very pleased with the response and service we received for our plumbing leak situation!",
    date: "March 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    serviceTags: ["plumbing", "emergency-plumbing"],
  },
  {
    id: "jacolby-poston-2026-05",
    name: "Jacolby Poston",
    rating: 5,
    quote:
      "Freds you have acquired a great assets in scott and jeremy as well. Scott has been taking care of my property since i meet him and has done an excellent job. Along with jeremy you guys have two valuable assets that's worth more than holding on too. I will always use these guys here at The Celine and anywhere else basically.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    serviceTags: ["commercial-plumbing", "maintenance", "apartments"],
  },
  {
    id: "stacy-koss-2026-01",
    name: "Stacy Koss",
    rating: 5,
    quote:
      "I called Fred's this morning requesting assistance with a dripping sound coming from an unknown source. I felt compelled to write a review about Jeremy May who showed up today to help and was absolutely phenomenal! He answered all of my questions and diagnosed and repaired the issue quickly. He was so friendly and cleaned up after himself, which is always appreciated. Thank you so much Jeremy and Fred for the fantastic service!",
    date: "January 2026",
    source: "google",
    reviewerMeta: "11 reviews · 1 photo",
    serviceTags: ["plumbing", "emergency-plumbing"],
  },
  {
    id: "alex-barillas-2026-01",
    name: "Alex Barillas",
    rating: 5,
    quote:
      "Matthew did an excellent job with the service call he made at our property today, and in addition to that, he provided great customer service, which is greatly appreciated. I simply have to say that it was the best plumbing service we've ever had...That's the before and after – an amazing result.",
    date: "January 2026",
    source: "google",
    reviewerMeta: "13 reviews · 2 photos",
    serviceTags: ["commercial-plumbing", "plumbing"],
  },
  {
    id: "dwayne-johnson-2026-02",
    name: "Dwayne Johnson",
    rating: 5,
    quote:
      "If you ever run run across Fred With Fred's Plumbing, he's not the owner, but he takes care of business like like he owns it you would swear this man dreams of Plumbing. He is an awesome plumber. You have to give great people their flowers while they're here. I appreciate you thank you.",
    date: "February 2026",
    source: "google",
    reviewerMeta: "Local Guide · 13 reviews · 2 photos",
    serviceTags: ["plumbing"],
  },
  {
    id: "daniel-martinez-2026-05",
    name: "Daniel Martinez",
    rating: 5,
    quote:
      "I had two plumbers here at my popper today with different issues. Both Plumbers tackled the issues separately and expediently, very polite and knowledgeable individuals.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "4 reviews",
    serviceTags: ["plumbing", "commercial-plumbing"],
  },
  {
    id: "cooper-root-2026-07",
    name: "Cooper Root",
    rating: 5,
    quote:
      "Wonderful company!! They unclogged my pipes and I'm thankful for the freedom",
    date: "July 2026",
    source: "google",
    reviewerMeta: "1 review",
    serviceTags: ["drain-sewer"],
  },
  {
    id: "randy-mooneyham-2025-10",
    name: "Randy Mooneyham",
    rating: 5,
    quote:
      "Mitch is an absolutely awesome guy and knows his stuff. He us a major asset to Fred's plumbing and just an awesome guy. Jordan tge dispatcher is just as awesome she handles calls and dispatch beautifully. Y'all are very lucky to have her and him. Company as a whole I wouldn't use anybody else. David with freds plbg is just freakin awesome got the jobs done and great attitude like him.",
    date: "October 2025",
    source: "google",
    reviewerMeta: "Local Guide · 286 reviews",
    serviceTags: ["commercial-plumbing", "maintenance"],
  },
  {
    id: "jimmy-coria-2026-01",
    name: "Jimmy Coria",
    rating: 5,
    quote:
      "David and Jeremy did an amazing job, AGAIN, working on our property. Everytime we have needed Freds plumbing they have always done en amazing job. Quickly and very professional. 24/7 .",
    date: "January 2026",
    source: "google",
    reviewerMeta: "Local Guide · 18 reviews · 15 photos",
    serviceTags: ["commercial-plumbing", "emergency-plumbing", "apartments"],
  },
  {
    id: "natalie-finch-2025-12",
    name: "Natalie Finch",
    rating: 5,
    quote:
      "Nathan was super professional and personable. He was able to get the job done in a timely manner and resolved the issue we were experiencing. Thankful for his time and expertise!",
    date: "December 2025",
    source: "google",
    reviewerMeta: "6 reviews",
    serviceTags: ["plumbing"],
  },
];
