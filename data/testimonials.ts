/**
 * Real customer reviews from Fred's Plumbing's public Google Business
 * Profile — REGENERATED from the owner's full listing export
 * (`google-reviews-export.csv`, captured 2026-07-30) by
 * `scripts/convert-reviews-csv.ts`. Don't hand-edit quotes here; re-run the
 * converter against a fresh export instead. Curation (`featured`,
 * `serviceTags`, `role`) is hand-maintained and survives regeneration.
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
 * - `date` is the human-readable month of the export's estimated review date
 *   ("2026-07-31" → "July 2026"). The export's relative dates were already
 *   stale at capture time and are never used.
 * - Reviewer profile photos and review photos are deliberately NOT stored or
 *   hotlinked; Google restricts caching them. `TestimonialCard` renders an
 *   initial circle.
 * - `ownerReply` is stored verbatim but not rendered anywhere yet.
 * - `serviceTags` drive which reviews surface on which service / property-type
 *   page. Values must match a real slug in `data/services.ts` or
 *   `data/industries.ts` — an unknown tag silently shows the review nowhere.
 */

/** Where a review came from. Only Google is wired today. */
export type TestimonialSource = "google" | "direct";

export interface Testimonial {
  /** Stable key — "g-" + a hash of the Google Review ID. Used as the React
   *  key and (prefixed) as the Sanity document id by the import script. */
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
  /** The business's public reply on Google, verbatim. Stored, not rendered. */
  ownerReply?: string;
  /** Relative reply date as captured at export time ("3 months ago"). */
  ownerReplyDate?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "g-b743c8d01a",
    name: "Cornelius Morris",
    rating: 5,
    quote:
      "The service was fast and done properly. Best plumber I used in Dallas by far. Trey was great on time and very knowledgeable and professional.",
    date: "July 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "Appreciate your support Cornelius! Have a great week.",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-92db35a8e6",
    name: "Amy Rainwater",
    rating: 5,
    quote:
      "Just want to share that Scott came out did a great job! We have used this company and was very iffy after new management but I have been nothing but impressed. Thanks for the hard work and will enjoy working with you all. I love seeing people that really loves and enjoys their job.",
    date: "July 2026",
    source: "google",
    reviewerMeta: "5 reviews",
  },
  {
    id: "g-b21df867b9",
    name: "Jonathan GmzTM",
    rating: 5,
    quote:
      "Great Guys at Freds Plumbing Great job done by Mich! At one of our properties in North Dallas",
    date: "July 2026",
    source: "google",
    reviewerMeta: "11 reviews",
  },
  {
    id: "g-382e7c8f42",
    name: "oscar sanchez",
    rating: 5,
    quote:
      "Great service and prompt response to solve water low pressure issues",
    date: "July 2026",
    source: "google",
    reviewerMeta: "4 reviews",
  },
  {
    id: "g-a17d6f76dd",
    name: "Gavin Campbell",
    rating: 5,
    quote:
      "A big shout out to bill. Did a great job last week.",
    date: "July 2026",
    source: "google",
    reviewerMeta: "Local Guide · 9 reviews",
  },
  {
    id: "g-a5eb05ad85",
    name: "Sarah Davidson",
    rating: 5,
    quote:
      "Had an awesome experience with Treye! He was skilled and professional.",
    date: "July 2026",
    source: "google",
    reviewerMeta: "Local Guide · 16 reviews",
  },
  {
    id: "g-e3d5fac37c",
    name: "Roosevelt Womack",
    rating: 5,
    quote:
      "Treye Welch showed up and did an amazing job Thank you Treye 👍 …",
    date: "July 2026",
    source: "google",
    reviewerMeta: "3 reviews",
    ownerReply:
      "Thank you for the 5 stars! ⭐ We truly appreciate your support and are grateful for the opportunity to serve you. At Fred’s Plumbing, we’re committed to delivering reliable service every time. Thank you for being part of our community!",
    ownerReplyDate: "9 months ago",
  },
  {
    id: "g-72ee838f6f",
    name: "John Hamm",
    rating: 5,
    quote:
      "As always, I can depend on the team at Fred's Plumbing to respond quickly and complete the job professionally! Fred Gray was onsite to prepare a bid, and on finding a few units on the verge of failure, called in reinforcements and got FIVE emergency repairs done after a full morning walking units! I cannot recommend Fred's Plumbing enough!",
    date: "July 2026",
    featured: true,
    source: "google",
    reviewerMeta: "4 reviews",
    serviceTags: ["emergency-plumbing", "commercial-plumbing", "plumbing", "apartments"],
    ownerReply:
      "We work really hard to have happy customers - and Fred Gray goes above and beyond - so thank you for taking the time to recognize that. We appreciate yall as customers. See you next time!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-3677f29733",
    name: "Lou Benson",
    rating: 5,
    quote:
      "Scott Watson did great work. Very professional",
    date: "July 2026",
    source: "google",
    reviewerMeta: "7 reviews",
    ownerReply:
      "Scott is an asset to the Fred's plumbing team! Thank you for the shout out. Call us next time you need plumbing help!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-7fe0b9b531",
    name: "Camryn Root",
    rating: 5,
    quote:
      "They fixed EVERYTHING! Faster than I have ever seen and for a great price!",
    date: "July 2026",
    source: "google",
    reviewerMeta: "11 reviews",
    ownerReply:
      "Thank you Camryn! We focus on fair price and service with integrity. Have a great week.",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-832d294258",
    name: "Cooper Root",
    rating: 5,
    quote:
      "Wonderful company!! They unclogged my pipes and I’m thankful for the freedom",
    date: "July 2026",
    source: "google",
    reviewerMeta: "1 review",
    serviceTags: ["drain-sewer"],
    ownerReply:
      "We are clogged pipe specialists! Call us next time you need help. Thank you!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-0b4cbba75d",
    name: "Bailey Beckett",
    rating: 5,
    quote:
      "Jeremy and Scott came out for an emergency plumbing issue and were extremely quick to find and resolve the issue. Great communication! Hands down would recommend them for any plumbing job you have!",
    date: "July 2026",
    source: "google",
    reviewerMeta: "Local Guide · 32 reviews · 4 photos",
    serviceTags: ["emergency-plumbing", "plumbing"],
    ownerReply:
      "We focus on both great plumbing and great service. We always aim to improve. Thank you for the support!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-56e37e476a",
    name: "M. Jennings",
    rating: 5,
    quote:
      "Very professional crew. They had all the right tools and knew how to use them. Did an excellent job fixing the problem.",
    date: "July 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "Thank you sir - we appreciate having customers like you. Have a great week!~",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-7c738c9747",
    name: "Steven Meneses",
    rating: 5,
    quote:
      "Great service",
    date: "July 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "Thank you Steven. Appreciate the support.",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-0c4a492137",
    name: "Ajay Riyar",
    rating: 5,
    quote:
      "Trey and Jeremy, you both were absolutely superb at your work. I truly appreciate all the hard work, dedication, and effort you put into getting everything fixed. Your professionalism, attention to detail, and willingness to help made a big difference. Thank you for your excellent service and for going above and beyond—I’m really grateful for all your help.",
    date: "July 2026",
    source: "google",
    reviewerMeta: "7 reviews",
    ownerReply:
      "Reviews like this help keep our team going. Thank you for the support!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-6492f01f39",
    name: "Fabian Ramos",
    rating: 5,
    quote:
      "David was great",
    date: "July 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "David is an amazing team member at Fred's. We are lucky to have him. We appreciate your business!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-dfd06ba7a1",
    name: "James Houston",
    rating: 5,
    quote:
      "I use Fred's on all my muti family properties they are clean and professional and always clean up after job is complete",
    date: "June 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "Thank you James! We take pride in our work, our customer service, and will continue to improve in all aspects. We don't take our customers, or the opportunity to fix plumbing emergencies, for granted.",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-41dc9201f0",
    name: "Mike Brickey",
    rating: 5,
    quote:
      "I had a major leak . I called Fred’s plumbing and they came out same day.Had water fixed that day.thank you so much",
    date: "June 2026",
    source: "google",
    reviewerMeta: "11 reviews",
    ownerReply:
      "Thank you Mike! Glad we delivered on our own internal expectations. Appreciate the call - see you next time.",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-fa7b98aa92",
    name: "La'Quarrio Fleming",
    rating: 5,
    quote:
      "Mr. Scott Watson was great he came in and got Job done very efficiently, and I love his quality of work",
    date: "June 2026",
    source: "google",
    reviewerMeta: "11 reviews",
    ownerReply:
      "Appreciate the shout out, Alex is a great plumber! We aim for 5 stars experiences at all times and are grateful to have you as a customer.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-27c9200882",
    name: "Horacio Jaques",
    rating: 5,
    quote:
      "Trey did a tremendous job at the crosby 411 and 311 very clean which I knew this company in the past great job 👏 👍 guys …",
    date: "June 2026",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thank you Horacio! We have a great group of experienced multi-family plumbers and Trey is one of them. See you next time!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-4a23773168",
    name: "Arian Hurtado",
    rating: 5,
    quote:
      "We had a great experience with this plumber. Highly recommend for any plumbing repairs or maintenance needs!",
    date: "June 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    ownerReply:
      "Thank you so much Arian. Jeremy is a great plumber and great guy. We appreciate your support - call us next time you need us!",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-96df62da3e",
    name: "Emmanuel Tamayo",
    rating: 5,
    quote:
      "Excellent worker",
    date: "June 2026",
    source: "google",
    reviewerMeta: "6 reviews",
    ownerReply:
      "Thank you for the shout out - we appreciate it!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-17d797bf6f",
    name: "Marcus Sterns",
    rating: 5,
    quote:
      "I would have to say to Work has been impeccable since the relationship started I would recommend Fred G on any Job….💯💯💯 …",
    date: "June 2026",
    source: "google",
    reviewerMeta: "Local Guide · 14 reviews",
    ownerReply:
      "Fred G puts a capital M in Master Plumber! Thank you for the call Marcus - we appreciate your support!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-1d3e7ba799",
    name: "Tim Barnes",
    rating: 5,
    quote:
      "Scott was fantastic, very knowledgeable, took care of us quickly and respected tenants as well our area, cleaned up. Would definitely request his services!!!",
    date: "June 2026",
    source: "google",
    reviewerMeta: "Local Guide · 12 reviews",
    serviceTags: ["plumbing", "commercial-plumbing", "apartments"],
    ownerReply:
      "Yessss. Scott is fantastic and we all appreciate your support. Thank you, see you next time!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-c716b5ece8",
    name: "RoxeGo",
    rating: 5,
    quote:
      "Very good job and professional fred g",
    date: "June 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "Thank you for the shout out RoxeGo! We appreciate the support. Fred is amazing plumbing too!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-b5b0b9de67",
    name: "Quinanthony Johnson",
    rating: 5,
    quote:
      "Fred Gray did a great job of explaining and fixing the issue I had with the water fow",
    date: "June 2026",
    source: "google",
    reviewerMeta: "3 reviews",
    ownerReply:
      "Thank you for the shout out for Fred! He's a plumbing savant!!",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-d4a4217d47",
    name: "Abel LINARES",
    rating: 5,
    quote:
      "Fred G was amazing!!",
    date: "May 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "He really is. Thank you for the support! We are grateful for all our customers that keep calling us back out and spread the word.",
    ownerReplyDate: "2 weeks ago",
  },
  {
    id: "g-172180d9b4",
    name: "Lauren Morgan",
    rating: 5,
    quote:
      "We appreciate you all!! Lauren Hightower",
    date: "May 2026",
    source: "google",
    reviewerMeta: "12 reviews",
    ownerReply:
      "Lauren, we appreciate you all as well! Thank you so much for sharing your experience we’re grateful for the opportunity to serve you. We're always here whenever you need us!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-0b76dde8bc",
    name: "Dexter “TheSonofSam” Diggs",
    rating: 5,
    quote:
      "Mr. David responded to a time schedule that was appropriate for him as he was working at another site. I showed and did a wonderful job.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "Thank you sir. Appreciate the support. Call us next time you need us!",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-800c06477b",
    name: "Sergio 0206",
    rating: 5,
    quote:
      "May 25, 2026. Excellent work from David Sikes & Jeremy May this Memorial Day! These two experts repaired a main water line to the high rise building I work at in downtown Dallas. A resident drilled a hole into the water line by accident in an attempt to hang a mirror & flooded his bedroom before I could shut off the water. David & Jeremy preformed the repair & inspected the repair with the water turned back on at full pressure with 0 leaks. Thanks to the expertise of these two gentlemen, the water was turned back on for all residents in a timely manner. David, Jeremy, & Fred’s have my gratitude.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "3 reviews · 4 photos",
    serviceTags: ["emergency-plumbing", "commercial-plumbing", "plumbing", "condos"],
    ownerReply:
      "Appreciate that Sergio! Our guys our great at what they do and I'm glad they got to show you and spare you some holiday headaches. Hit us up next time you need us. Thank you sir",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-016026b09b",
    name: "Elizabeth Scalf",
    rating: 5,
    quote:
      "David C. came out to my apartment within day and fixed a leaking pipe from a unit above me that was dripping into my apartment. He had to go up and down stairs the whole time but did not complain. He explained what that he would be coming and in out and was very nice and courteous when doing so. At the end, he took the time to explain what he fixed.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "1 review",
    serviceTags: ["plumbing", "emergency-plumbing", "apartments"],
    ownerReply:
      "Thanks for the shoutout - David is an awesome plumber and a great guy! I'm glad we were able to help you out and solve your plumbing problems.",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-ef3f178068",
    name: "sil 0001silver",
    rating: 5,
    quote:
      "Scott did an amazing job and was so courteous! Fixed my shower and tub spouts pretty quickly! We know we’re in good hands! Thank you so much!",
    date: "May 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    serviceTags: ["plumbing", "apartments"],
    ownerReply:
      "Scott is an experienced professional and I'm glad he was able to help you out quick and efficiently. Thanks for giving him a shout out!",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-651d690090",
    name: "Jennifer Alford",
    rating: 5,
    quote:
      "Scott and David C. are awesome. Always respectfully, kind, and courteous! Thank you so much for always taking care of me.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "1 review",
    serviceTags: ["plumbing", "maintenance"],
    ownerReply:
      "Appreciate the shout out on the positive experience! It means a lot to small businesses like ours. Scott and David are great! Thank you",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-5194a90a6f",
    name: "Daniel Martinez",
    rating: 5,
    quote:
      "I had two plumbers here at my popper today with different issues. Both Plumbers tackled the issues separately and expediently, very polite and knowledgeable individuals.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "4 reviews",
    serviceTags: ["plumbing", "commercial-plumbing"],
    ownerReply:
      "Love that. That’s what we aim for everytime. We aren’t perfect but we try our best for great plumbing and great customer service. Thank you for the support.",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-1926fb79b5",
    name: "Curtis Wheeler",
    rating: 5,
    quote:
      "Bill was awesome located the leak in no time fantastic",
    date: "May 2026",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thank you so much for your kind words and for taking the time to leave a review for Trey! We truly appreciate your support and are thrilled to hear you had a great experience with Fred’s Plumbing. Our team works hard to provide reliable, efficient, and honest service, especially for our multifamily property partners and it means a lot to know it’s making a difference. We look forward to helping you again whenever you need us! — The Fred’s Plumbing Team",
    ownerReplyDate: "9 months ago",
  },
  {
    id: "g-a5337c307c",
    name: "Jacolby Poston",
    rating: 5,
    quote:
      "Freds you have acquired a great assets in scott and jeremy as well. Scott has been taking care of my property since i meet him and has done an excellent job. Along with jeremy you guys have two valuable assets that’s worth more than holding on too. I will always use these guys here at The Celine and anywhere else basically.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    serviceTags: ["commercial-plumbing", "maintenance", "apartments"],
    ownerReply:
      "Yes sir. We don't take that for granted. Our company is only has strong as our team - and we added some great teammates to the roster recently. Appreciate the support and the shout out. Let us know if you need anything from us, or if we can do anything to improve our service. Always looking to improve. Thank you.",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-3c1721639b",
    name: "Lee Jarnagin",
    rating: 5,
    quote:
      "David C. and Alex did great!",
    date: "May 2026",
    source: "google",
    reviewerMeta: "4 reviews",
    ownerReply:
      "Thanks Lee! Appreciate the support. Those are two great, experienced plumbers. See you next time.",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-8591b0fd96",
    name: "TTV Goat",
    rating: 5,
    quote:
      "Thanks to the plumber that they sent out today. He did exactly what needed to be done to get the issue resolved.",
    date: "May 2026",
    source: "google",
    reviewerMeta: "10 reviews",
    ownerReply:
      "Appreciate the support. See you next time!",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-fdc7081bad",
    name: "Jesus Umanzor",
    rating: 5,
    quote:
      "Jeremy May with Fred’s Plumbing was outstanding from start to finish. We had a clogged toilet issue, and he quickly diagnosed the problem and accessed the pipe through the wall above the toilet to get everything cleared properly. He explained the process, worked efficiently, cleaned up after himself, and made sure everything was working before leaving. Great customer service, professional attitude, and quality work. Definitely recommend Jeremy May and Fred’s Plumbing!",
    date: "May 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    serviceTags: ["drain-sewer", "plumbing"],
    ownerReply:
      "Thank you Jesus! Appreciate you sharing our positive experience. We are lucky to have Jeremy on our team. Hit us up next time you need us!",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-bc33e2d533",
    name: "Carlos Rodriguez",
    rating: 5,
    quote:
      "Good communication and a hard worker",
    date: "May 2026",
    source: "google",
    reviewerMeta: "4 reviews",
    ownerReply:
      "Thanks Carlos! I think that describes everyone on our team - we are very fortunate to have a great group of plumbers. Appreciate the support - call us next time you need us!",
    ownerReplyDate: "2 months ago",
  },
  {
    id: "g-91520a035e",
    name: "moises plata",
    rating: 5,
    quote:
      "Fred G. Is very friendly and very, very knowledgeable he knows his job and performed it very well every single time I have been contracting Fred's plumbing for almost a decade now and all the techs are top notch",
    date: "April 2026",
    source: "google",
    reviewerMeta: "Local Guide · 74 reviews · 5 photos",
    serviceTags: ["commercial-plumbing", "maintenance"],
    ownerReply:
      "Thank you Moises! Fred is the ultimate plumbing problem solver and we are lucky to have him on the team. We appreciate your continued business and support!",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-caf072ce3f",
    name: "fjs20000",
    rating: 5,
    quote:
      "respectful, professional, he did a great job thank you thanks Jeramy",
    date: "April 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    ownerReply:
      "Thank you for the support! We are glad Jeremy was able to bang through your plumbing problem",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-51ad028ad1",
    name: "Blaine Garza",
    rating: 5,
    quote:
      "Quick and painless service. Arrived as scheduled and remedied the situation quickly.",
    date: "April 2026",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thanks Blaine - we appreciate the support! Call us next time you need some plumbing experts",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-a805e67fe9",
    name: "Sandy Reynolds",
    rating: 5,
    quote:
      "Very impressed with Trey!!! Very professional great job fixing our leak!!!",
    date: "April 2026",
    source: "google",
    reviewerMeta: "Local Guide · 26 reviews",
    ownerReply:
      "Awesome to hear. Trey is a true professional. Thanks for the support and please tell others if they need a plumber! Thanks, Sandy.",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-e19b805541",
    name: "Dominique Roy",
    rating: 5,
    quote:
      "David L. And Alex did a great job",
    date: "April 2026",
    source: "google",
    reviewerMeta: "Local Guide · 30 reviews",
    ownerReply:
      "Thanks Dominique those are two great Fred’s plumbers. Appreciate the support, see you next time!",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-44e48c27d7",
    name: "arthur schultz",
    rating: 5,
    quote:
      "Fread+s has always been a outstanding pro .. Thank you much Andy \"flats of Brent wood\"",
    date: "April 2026",
    source: "google",
    reviewerMeta: "3 reviews",
    ownerReply:
      "Thanks Arthur - we work hard to provide an A+ experience for our multifamily customers so we appreciate the recognition.... which all belongs to Fred on this one. He's an amazing plumber! (and great fisherman)",
    ownerReplyDate: "3 months ago",
  },
  {
    id: "g-18155b86ea",
    name: "Rodney Weatherly",
    rating: 5,
    quote:
      "Tech was fast , through and cleaned up afterwards. A+ Efforts",
    date: "March 2026",
    source: "google",
    reviewerMeta: "Local Guide · 14 reviews",
    ownerReply:
      "Thanks Rodney! Appreciate your support.",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-6f473a46c9",
    name: "Martin Martinez",
    rating: 5,
    quote:
      "David L did an outstanding job! He was very courteous and professional as well as prompt and we were very pleased with the response and service we received for our plumbing leak situation!",
    date: "March 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    serviceTags: ["plumbing", "emergency-plumbing"],
    ownerReply:
      "Thanks Martin! David L can fix anything. Great professional plumber, and guy. Thanks for your business.",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-cfccce6fb4",
    name: "Arturo Gutierrez",
    rating: 5,
    quote:
      "Calvin did an awesome job 👏 …",
    date: "March 2026",
    source: "google",
    reviewerMeta: "10 reviews",
    ownerReply:
      "Calvin is an awesome plumber and a great guy. Appreciate the shout out on a positive experience. Hit us up next time you need a plumber!",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-f6ddeae220",
    name: "Dwayne Johnson",
    rating: 5,
    quote:
      "If you ever run run across Fred With Fred’s Plumbing, he’s not the owner, but he takes care of business like like he owns it you would swear this man dreams of Plumbing. He is an awesome plumber. You have to give great people their flowers while they’re here. I appreciate you thank you. 🙏🏾 From the pebble not the rock,🤘 …",
    date: "February 2026",
    source: "google",
    reviewerMeta: "Local Guide · 13 reviews · 2 photos",
    serviceTags: ["plumbing"],
    ownerReply:
      "100%. Fred takes care of the business like his own, and his customers like they are his family. He is an asset to our team and the shout out is appreciated!",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-133ca177de",
    name: "Julian Lara",
    rating: 5,
    quote:
      "He did an excellent job with the repair, and was very kind to the resident in explaining the work process.",
    date: "February 2026",
    source: "google",
    reviewerMeta: "9 reviews",
    ownerReply:
      "Thank you Julian! Our team takes pride in their work and we are grateful to have you as a customer.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-9937412909",
    name: "Evan Collins",
    rating: 5,
    quote:
      "Fred's Plumbing is amazing! David L. did a great job. Job was done before I expected it to be!",
    date: "February 2026",
    source: "google",
    reviewerMeta: "11 reviews",
    ownerReply:
      "David L can fix anything! Thanks for giving him some love. Our guys work hard to help fix our customers plumbing problems and we appreciate your support!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-e399a6363b",
    name: "Cesar Sandoval",
    rating: 5,
    quote:
      "Good job my brother thank you for you help nice to have vendors that we can rely on",
    date: "February 2026",
    source: "google",
    reviewerMeta: "Local Guide · 76 reviews",
    ownerReply:
      "Thank you, Cesar! We appreciate you trusting us with your plumbing repairs and will be there for you for the next one.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-5b72d3a967",
    name: "Cris M",
    rating: 5,
    quote:
      "Fred's plumbing has come bail me out several times and they are the best berry professional also grate communication.",
    date: "January 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "Appreciate that Cris. Our plumbers work at all hours and in all environments to help our customers, but our admin team works hard as well to make sure our customer's get the communication they need. See you next time!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-2cb95fe404",
    name: "Felipe Castillo",
    rating: 5,
    quote:
      "Tray R.took care of our emergency call in a boiler he did a good job he maintain me informed at all times about the process of fix it.",
    date: "January 2026",
    source: "google",
    reviewerMeta: "6 reviews",
    ownerReply:
      "Thank you so much!",
    ownerReplyDate: "7 months ago",
  },
  {
    id: "g-84379adc47",
    name: "Rigo Perez",
    rating: 5,
    quote:
      "Jeremy did a great job he Communicated very well with me. I was pleased with his work.",
    date: "January 2026",
    source: "google",
    reviewerMeta: "Local Guide · 25 reviews",
  },
  {
    id: "g-f66cfa2daf",
    name: "Migue De La Cerda",
    rating: 5,
    quote:
      "Thanks Jeremy for you great job and fast respond to the service call!",
    date: "January 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "Thank you Migue! Jeremy is a great plumber and a great guy. We aim for fast and quality service so our customers can get back to life without plumbing problems. Appreciate you being a customer.",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-21f2bc759c",
    name: "Alex Barillas",
    rating: 5,
    quote:
      "Matthew did an excellent job with the service call he made at our property today, and in addition to that, he provided great customer service, which is greatly appreciated.I simply have to say that it was the best plumbing service we've ever had...That's the before and after – an amazing result.",
    date: "January 2026",
    source: "google",
    reviewerMeta: "13 reviews · 2 photos",
    serviceTags: ["commercial-plumbing", "plumbing"],
    ownerReply:
      "Matthew is one of our master plumbers and he does GREAT work! That is a good looking repair and I'm glad you had a seamless experience with Fred's. We appreciate you as a customer and look forward to helping next time!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-d79a9ace0c",
    name: "Jeffrey Janway",
    rating: 5,
    quote:
      "Jeremy worked great",
    date: "January 2026",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Jeremy is a rockstar. Thanks for choosing Freds!",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-e584ea8300",
    name: "Dora Rios",
    rating: 5,
    quote:
      "The tech did an amazing job on repairing our boiler in the riser room. His workmanship was clean and had very good communication with the staff.",
    date: "January 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "Thank you for the recognition. We take pride in great plumbing work and great customer service. Call us next time you need help!",
    ownerReplyDate: "4 months ago",
  },
  {
    id: "g-fd3edb8db5",
    name: "Ernesto Cabral",
    rating: 5,
    quote:
      "Every time David L has worked in any property that i have been at he has always been professional and very helpful with any issues that we have had",
    date: "January 2026",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "Thank you, Ernesto for your kind review. Thank you for entrusting in Fred's to take care of all your plumbing needs.",
    ownerReplyDate: "a year ago",
  },
  {
    id: "g-2f7227d668",
    name: "Dale Noack",
    rating: 5,
    quote:
      "Jeremy May and Calvin did a really good job had the toilet pulled the whole dug and cleaned out and the repair fixed all in 2 days",
    date: "January 2026",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thanks Dale! Jeremy and Calvin are great plumbers and great guys. We really appreciate your feedback and support. See you next time!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-6220c7eefb",
    name: "Just Bright",
    rating: 5,
    quote:
      "Was the perfect experience fast and efficient very clean and organized guy",
    date: "January 2026",
    source: "google",
    reviewerMeta: "4 reviews",
    ownerReply:
      "Thank you! We aim to provide fast, reliable, efficient, and honest service so thank you for recognizing that. See you next time!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-2e94ed36d5",
    name: "Lorenzo Mcclinton",
    rating: 5,
    quote:
      "David Lorenz is the best, he came out and took care of our problem very clean and professional Highly recommend!",
    date: "January 2026",
    source: "google",
    reviewerMeta: "4 reviews",
    ownerReply:
      "Agree! Lorenz is an asset to our team and we are lucky to have him. And thank you for sharing your experience. We really appreciate you trusting Fred's with your plumbing needs. We'll be here next time you need us!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-f49d740527",
    name: "david burkman",
    rating: 5,
    quote:
      "Jay did an excellent job of getting a toilet unclogged for us. Fast, professional, and cleaned up the area when he was finished. 10 out of 10!",
    date: "January 2026",
    source: "google",
    reviewerMeta: "3 reviews",
  },
  {
    id: "g-ebeae62f40",
    name: "Tom Tanner",
    rating: 5,
    quote:
      "In and out fast no problems, nice and courteous, thank you",
    date: "January 2026",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thank you, Tom. We appreciate your support and are grateful to have you as a customer!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-4da27805c6",
    name: "Favorite songs Keo",
    rating: 5,
    quote:
      "David L was a great service man , he came and fixed our public restroom toilet and very minimum time . I am very happy to get that broken toilet done . Thank you David L",
    date: "January 2026",
    source: "google",
    reviewerMeta: "5 reviews",
    ownerReply:
      "David L can fix any problem - plumbing and beyond! We appreciate your review and support, and are grateful to have you as a customer. Thanks for calling Fred's.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-48e84b371b",
    name: "Moses Vacha",
    rating: 5,
    quote:
      "Calvin installed water heater at my place and went above and beyond",
    date: "January 2026",
    source: "google",
    reviewerMeta: "Local Guide · 17 reviews",
    ownerReply:
      "Thanks Moses! Calvin is an asset to the team and we appreciate you acknowledging when our guys put in the extra effort",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-c95c523b08",
    name: "Stacy Koss",
    rating: 5,
    quote:
      "I called Fred’s this morning requesting assistance with a dripping sound coming from an unknown source. I felt compelled to write a review about Jeremy May who showed up today to help and was absolutely phenomenal! He answered all of my questions and diagnosed and repaired the issue quickly. He was so friendly and cleaned up after himself, which is always appreciated. Thank you so much Jeremy and Fred for the fantastic service!",
    date: "January 2026",
    source: "google",
    reviewerMeta: "11 reviews · 1 photo",
    serviceTags: ["plumbing", "emergency-plumbing"],
    ownerReply:
      "Love hearing this! Our guys take pride in their work and we love it when our customers are so happy they want to acknowledge it. Jeremy is an asset to the team and we are lucky to have him - so feel free to ask for him next time you need help. Thank you for your support Stacy, see you next time.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-75f3abfb15",
    name: "Jimmy Coria",
    rating: 5,
    quote:
      "David and Jeremy did an amazing job, AGAIN,working on our property. Everytime we have needed Freds plumbing they have always done en amazing job. Quickly and very professional.24/7 .",
    date: "January 2026",
    source: "google",
    reviewerMeta: "Local Guide · 18 reviews · 15 photos",
    serviceTags: ["commercial-plumbing", "emergency-plumbing", "apartments"],
    ownerReply:
      "Yessss. Thank you Jimmy! We really value our customers and thank you so much for the positive feedback. Our team works really hard and love seeing that customers are happy and appreciate it. We'll be there for you AGAIN when you need us!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-b76f5527da",
    name: "S Reyes",
    rating: 5,
    quote:
      "Jay was very professional very understanding did a good job so thank you for your service",
    date: "January 2026",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "Thank you! Appreciate the shout out and for trusting Fred's. We value having you as a customer.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-ccd58ecb00",
    name: "Sonja Jackson",
    rating: 5,
    quote:
      "Krissy has been one of the BEST VENDOR I have ever had a chance to work with! She has a beautiful personality and very knowledgeable about her business! I would recommend her to anyone! For your next plumbing problem, give her a call!",
    date: "January 2026",
    source: "google",
    reviewerMeta: "Local Guide · 29 reviews",
    ownerReply:
      "Thank you Sonja! Krissy is everything that makes Fred's great. She is attentive and knowledgeable and helps ensure our team provides fast, reliable, and professional service that is honest and fair. We appreciate having you as a customer!!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-e8e4ac06b3",
    name: "Isaac Acosta",
    rating: 5,
    quote:
      "Jeremy is Great to work with. Gets in and out taking care of the job as requested !",
    date: "December 2025",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Love it. Thank you for sharing your positive experience. we really appreciate your trust and support!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-47a84ba62d",
    name: "Adrian Jimenez",
    rating: 5,
    quote:
      "Technician Fred G was super helpful, fixed our plumbing issues in promptly manner . Very professional and knowledgeable. Would highly recommend Freds plumbing for all plumbing needs!!!",
    date: "December 2025",
    source: "google",
    reviewerMeta: "6 reviews",
    ownerReply:
      "Appreciate you Adrian! Thank you for the positive feedback and for being a customer. Fred G is as good as they get - ask for him next time you have an emergency!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-1dbc923914",
    name: "伊吹風子?",
    rating: 5,
    quote:
      "Krissy and Fred’s were great! Thank you",
    date: "December 2025",
    source: "google",
    reviewerMeta: "10 reviews",
  },
  {
    id: "g-fbe7316eed",
    name: "John Skillestad",
    rating: 5,
    quote:
      "Thomas and Fred’s great service! Great plumbers!",
    date: "December 2025",
    source: "google",
    reviewerMeta: "6 reviews",
  },
  {
    id: "g-a2f878a042",
    name: "Thanh Nguyen",
    rating: 5,
    quote:
      "Exceptional service,great people to work with honest and reliable great pricing. They knowledgeable and get things done right the first time would highly recommend.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "Local Guide · 18 reviews",
  },
  {
    id: "g-a7217b7a56",
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
    id: "g-2f6a7b4579",
    name: "Juan Pablo Guapacha",
    rating: 5,
    quote:
      "William was great. We had a leak and he helped us save more damage. Came to our place fast after hours. If you have an emergency that request 24/7 service call Fred’s",
    date: "December 2025",
    source: "google",
    reviewerMeta: "14 reviews",
  },
  {
    id: "g-caccd41cb0",
    name: "Tom Pauly",
    rating: 5,
    quote:
      "I got to see an awesome boiler repair that helped apartment get hot water back. Great plumbers great service.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "1 review",
  },
  {
    id: "g-6a3a3d2c45",
    name: "MLa",
    rating: 5,
    quote:
      "12/24/2025Jeremy and David did a great job today! This morning, we had a major problem where our tubs and toilets were overflowing with water. We had a major clog! My neighbors also had issues with their bathrooms. Jeremy and David were direct and to the point, and explained the problem to where we could understand what was wrong. Please consider calling them for your plumbing needs. We feel very blessed to know they were open after calling many other companies!",
    date: "December 2025",
    source: "google",
    reviewerMeta: "Local Guide · 79 reviews",
    ownerReply:
      "Thank you Michelle! Fred's is available 24/7 for your emergency plumbing needs. Our guys regularly pull all nighters to get water running again and fix problems. I'm glad you found us and we hope we won your business in the future! Feel free to ask for Jeremy and David next them next time, they are great!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-0bdb04682a",
    name: "TJ Little",
    rating: 5,
    quote:
      "Thomas did amazing boiler repair. Incredibly professional",
    date: "December 2025",
    source: "google",
    reviewerMeta: "1 review",
  },
  {
    id: "g-4e5eac71ef",
    name: "Carlos Albo",
    rating: 5,
    quote:
      "We had Fred's come out to our apartment as we had a broken pipe in the bathroom. They arrived quickly after we called and one of the guys explained what needed to be done. Overall, they did a great job. Thanks guys! CA",
    date: "December 2025",
    source: "google",
    reviewerMeta: "2 reviews",
  },
  {
    id: "g-c15aa37e77",
    name: "Danny Luong",
    rating: 5,
    quote:
      "Very impressed with his professionalism and could not be any more satisfied with their services ! Was able to fix my plumbing issues last minute",
    date: "December 2025",
    source: "google",
    reviewerMeta: "3 reviews",
  },
  {
    id: "g-0b8199facd",
    name: "Robert Barnes",
    rating: 5,
    quote:
      "Amazing service. Fast. Professional. Awesome. Highly recommend",
    date: "December 2025",
    source: "google",
    reviewerMeta: "1 review",
  },
  {
    id: "g-760f215e35",
    name: "Keontae Burns",
    rating: 5,
    quote:
      "Thomas was very helpful and responsive when it came to my plumbing needs. I will definitely use him again when needed.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "3 reviews",
  },
  {
    id: "g-22a7566915",
    name: "Jasmine Ritter",
    rating: 5,
    quote:
      "Thomas and William are the best. Awesome service",
    date: "December 2025",
    source: "google",
    reviewerMeta: "5 reviews",
  },
  {
    id: "g-957d9e5e48",
    name: "Jonathan",
    rating: 5,
    quote:
      "Thomas really fixed my pipes",
    date: "December 2025",
    source: "google",
    reviewerMeta: "3 reviews",
  },
  {
    id: "g-80edb90afb",
    name: "Samuel Ritter",
    rating: 5,
    quote:
      "Thomas and William are the best with the pipe",
    date: "December 2025",
    source: "google",
    reviewerMeta: "2 reviews",
  },
  {
    id: "g-bd1967622f",
    name: "Jacob Calvey",
    rating: 5,
    quote:
      "William did an incredible job helping get our hot water back! Will be using from now on.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "Local Guide · 16 reviews",
  },
  {
    id: "g-5dbbd342cc",
    name: "Wendy Shinsky",
    rating: 5,
    quote:
      "Thomas didn't excellent job fixing our apartment complex. Couldn't ask for better service.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "Local Guide · 30 reviews",
  },
  {
    id: "g-e090cc176a",
    name: "Natalie Finch",
    rating: 5,
    quote:
      "Nathan was super professional and personable. He was able to get the job done in a timely manner and resolved the issue we were experiencing. Thankful for his time and expertise!",
    date: "December 2025",
    source: "google",
    reviewerMeta: "6 reviews",
    serviceTags: ["plumbing"],
  },
  {
    id: "g-f84706302e",
    name: "Marta Pauly",
    rating: 5,
    quote:
      "Impressive plumbing work. The photos dont do justice. Mitch getting dirty.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "1 review",
  },
  {
    id: "g-3b7716ae17",
    name: "Julio Rodriguez",
    rating: 5,
    quote:
      "David L was great, provided fast and professional service. Explained the issue he found as well as explaining the repair he completed.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "4 reviews",
  },
  {
    id: "g-383a504bbb",
    name: "Nisa Martin",
    rating: 5,
    quote:
      "I had a great experience with David Lorenz. He is extremely knowledgeable and works very swiftly. He identified my plumbing issue right away and resolved it with no hassle. I really appreciate his expertise and professionalism. Highly recommend—thank you, David!",
    date: "December 2025",
    source: "google",
    reviewerMeta: "6 reviews",
    ownerReply:
      "Thanks Nisa! David L is an A+ plumber and can fix anything. Ask for him next time you have an emergency. Thank you again for being a customer, we appreciate you.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-9391981d34",
    name: "Kevin Lowery",
    rating: 5,
    quote:
      "David L is the best. We couldn't get the water all the way shut off and he manage to complete the. Job.",
    date: "December 2025",
    source: "google",
    reviewerMeta: "4 reviews",
    ownerReply:
      "David can repair anything, we love it! Thank you for being a customer and for the positive shout out!",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-b298a4d06c",
    name: "fer montanez",
    rating: 5,
    quote:
      "I have worked on the apartment industry for 25 years and since i found freds plumbing my days have been worry free these guys answer rigt a way take care of the issue and comunicate when everything is done so gladly give them 5 star for great service",
    date: "December 2025",
    source: "google",
    reviewerMeta: "Local Guide · 18 reviews",
    ownerReply:
      "We appreciate this review so much. Our team works hard to provide high quality plumbing services to the multifamily space in DFW and we love hearing from happy customers. Thank you for trusting us with your repairs. See you next time.",
    ownerReplyDate: "5 months ago",
  },
  {
    id: "g-d5af650335",
    name: "Dagoberto Cano",
    rating: 5,
    quote:
      "Good deal",
    date: "December 2025",
    source: "google",
    reviewerMeta: "6 reviews",
    ownerReply:
      "Thank you so much!",
    ownerReplyDate: "7 months ago",
  },
  {
    id: "g-b033e26d59",
    name: "R Dozier",
    rating: 5,
    quote:
      "We called Fred's plumbing out to our apartment community for a backflow install. David L was very communicative throughout the process and their team has been great to work with.",
    date: "November 2025",
    source: "google",
    reviewerMeta: "12 reviews",
    ownerReply:
      "Thank you so much for sharing this! We’re grateful for the opportunity to support your community, and we’re thrilled to hear David L kept communication clear throughout the installation he takes a lot of pride in his work and it shows. Our team truly enjoys working with partners like you, and we appreciate your trust in Fred’s Plumbing. We’re here anytime you need us!",
    ownerReplyDate: "7 months ago",
  },
  {
    id: "g-ae975f2f2f",
    name: "James Heath",
    rating: 5,
    quote:
      "Always a great job",
    date: "November 2025",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thank you so much! We truly appreciate your continued trust, it’s always a pleasure serving you.",
    ownerReplyDate: "7 months ago",
  },
  {
    id: "g-4876f6dff1",
    name: "Joshua Saddler",
    rating: 5,
    quote:
      "They came through and fixed the problem. It took them no time. Special thanks to Treye for making this situation we had easier!",
    date: "November 2025",
    source: "google",
    reviewerMeta: "5 reviews",
    ownerReply:
      "Thank you so much for sharing this! We’re glad our team was able to jump in quickly and get things resolved for you. Treye will be thrilled to know his effort made the situation easier, he takes a lot of pride in helping people. We truly appreciate you choosing Fred’s Plumbing, and we’re here anytime you need us!",
    ownerReplyDate: "7 months ago",
  },
  {
    id: "g-3ee4517ee6",
    name: "Larry Alexander",
    rating: 5,
    quote:
      "Mann once again Freds aways come thru with some of the best professional workers 20 stars hands down",
    date: "November 2025",
    source: "google",
    reviewerMeta: "2 reviews",
    ownerReply:
      "You just made our day! We’ll take those 20 stars and proudly stick them on the office wall, our guys work hard, so hearing this means everything. Thank you for always trusting Fred’s and for keeping us laughing too. We’ll be here next time with the same crew of “professional superheroes!”",
    ownerReplyDate: "7 months ago",
  },
  {
    id: "g-b23fb15887",
    name: "Edgar Quintero",
    rating: 5,
    quote:
      "David was extremely professional and knowledgeable. He arrived on time, quickly identified the issue, and explained everything clearly before starting the repair. His work was efficient and thorough, and he made sure everything was cleaned up before leaving. It’s hard to find someone who takes this much pride in their work — highly recommend David for any plumbing needs!",
    date: "November 2025",
    source: "google",
    reviewerMeta: "5 reviews",
    ownerReply:
      "Thank you so much for the kind words! We’re thrilled to hear that David provided such a professional and thorough experience. We take a lot of pride in our team and the quality of work we deliver, and it means a lot that you noticed. We truly appreciate your recommendation and are always here for any future plumbing needs!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-56a9209062",
    name: "Jonathan Powell",
    rating: 5,
    quote:
      "Great new ownership team",
    date: "October 2025",
    source: "google",
    reviewerMeta: "5 reviews",
    ownerReply:
      "Thank you so much for your review. We truly appreciate the feedback. Support like yours is what helps small businesses thrive, and we’re grateful for the opportunity to serve you!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-a34d0e3856",
    name: "Randy Mooneyham",
    rating: 5,
    quote:
      "Mitch is an absolutely awesome guy and knows his stuff. He us a major asset to Fred's plumbing and just an awesome guy. Jordan tge dispatcher is just as awesome she handles calls and dispatch beautifully. Y'all are very lucky to have her and him. Company as a whole I wouldn't use anybody else.David with freds plbg is just freakin awesome got the jobs done and great attitude like him.",
    date: "October 2025",
    source: "google",
    reviewerMeta: "Local Guide · 286 reviews",
    serviceTags: ["commercial-plumbing", "maintenance"],
    ownerReply:
      "Thank you so much for your kind words and for taking the time to leave a review for Mitch and Jordan! We truly appreciate your support and are thrilled to hear you had a great experience with Fred’s Plumbing. Our team works hard to provide reliable, efficient, and honest service, especially for our multifamily property partners and it means a lot to know it’s making a difference. We look forward to helping you again whenever you need us! — The Fred’s Plumbing Team",
    ownerReplyDate: "9 months ago",
  },
  {
    id: "g-8162476318",
    name: "Rocky Collis",
    rating: 5,
    quote:
      "Super knowledgeable and trustworthy team!",
    date: "October 2025",
    source: "google",
    reviewerMeta: "1 review",
    ownerReply:
      "Thank you so much for the kind words! We’re proud to have a knowledgeable and trustworthy team, and it means a lot that you noticed. We truly appreciate your support and look forward to helping you again whenever you need us!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-b0f075dbcb",
    name: "Seth Gordon",
    rating: 5,
    quote:
      "They are super professional and a well run company! Thank you!",
    date: "October 2025",
    source: "google",
    reviewerMeta: "6 reviews",
    ownerReply:
      "Thank you so much for the kind words! We’re proud to have a knowledgeable and trustworthy team, and it means a lot that you noticed. We truly appreciate your support and look forward to helping you again whenever you need us!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-66d803008e",
    name: "Matthew Durham",
    rating: 5,
    quote:
      "Trey and Brian have been awesome in meeting all plumbing needs.",
    date: "October 2025",
    source: "google",
    reviewerMeta: "4 reviews",
    ownerReply:
      "Thank you so much for the wonderful feedback! We’re proud to have Trey and Brian on our team, and we're thrilled to hear they’ve taken great care of your plumbing needs. We truly appreciate your support and look forward to serving you again in the future!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-30203391be",
    name: "Cindy Lerma",
    rating: 5,
    quote:
      "I am a property manager and I just want to give Fred’s plumbing a huge shout out! I had a leak that required immediate repair and they were on it! They went above and beyond to get the job done. From the actual plumbers to the office staff, absolutely awesome and professional! Wish I could give them 100 stars ⭐️",
    date: "October 2025",
    source: "google",
    reviewerMeta: "9 reviews",
    ownerReply:
      "Thank you so much for the amazing review and the shout-out! We truly appreciate you trusting Fred’s Plumbing, especially in an urgent situation. Our team prides itself on fast, reliable service and strong communication, so it means a lot that you noticed from the field to the office. We’re honored to be your plumbing partner and would give YOU 100 stars right back for being such a great property manager to work with! ⭐️💙",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-a936697ad0",
    name: "Alejandro Avalos",
    rating: 5,
    quote:
      "Justine and Treye were great they went above and beyond to fix the clogged drain in my pool room they did not give up until it was flowing freely. I definitely recommend using Fred’s plumbing they always fix my major plumbing issues.",
    date: "October 2025",
    source: "google",
    reviewerMeta: "Local Guide · 12 reviews",
    ownerReply:
      "Thank you so much for sharing your experience! We’re thrilled to hear that Justin and Treye went above and beyond to clear that drain, they’re dedicated to making sure things are working perfectly before they leave. We truly appreciate your trust and loyalty, and we’re always here whenever you need us. Thanks again for the recommendation!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-20eedbae3d",
    name: "josh perez",
    rating: 5,
    quote:
      "I’ve been using Fred’s Plumbing for a few months now, and there has not been a time where they’ve let me down. Always quick and professional service. If you need the job done right the first time give them a call",
    date: "October 2025",
    source: "google",
    reviewerMeta: "12 reviews",
    ownerReply:
      "Thank you so much for your continued trust in our team! We truly appreciate your loyalty and are thrilled to hear we've consistently delivered quick, professional service. It means a lot to us that you recommend Fred’s Plumbing for getting the job done right the first time. We're always here whenever you need us!",
    ownerReplyDate: "8 months ago",
  },
  {
    id: "g-0e0b8cbd49",
    name: "Amarilys ૮ . . ྀིა",
    rating: 5,
    quote:
      "Bryan is one of the best plumbers in the industry, his kindness shines through his work and I am very appreciate of his work ethic. He is very attentive and explains things thoroughly. Thank you.",
    date: "September 2025",
    source: "google",
    reviewerMeta: "14 reviews",
    ownerReply:
      "Thank you so much for your kind words and for taking the time to leave a review for Brian! We truly appreciate your support and are thrilled to hear you had a great experience with Fred’s Plumbing. Our team works hard to provide reliable, efficient, and honest service, especially for our multifamily property partners and it means a lot to know it’s making a difference. We look forward to helping you again whenever you need us! — The Fred’s Plumbing Team",
    ownerReplyDate: "9 months ago",
  },
  {
    id: "g-bde36fe98b",
    name: "Jack G (Tres)",
    rating: 5,
    quote:
      "Fred’s has been a huge help with our apartment project! We had clogged drains and pipes filled with grout, and their team was able to camera-locate, repair, and replace everything as needed to get us back in working order. The technicians were friendly, arrived on time, and even stayed late when necessary. They really helped us out of some tough situations. Highly recommend them—A+ service!",
    date: "September 2025",
    source: "google",
    reviewerMeta: "Local Guide · 138 reviews",
  },
  {
    id: "g-2fbd16d869",
    name: "Angela Sowers",
    rating: 5,
    quote:
      "Fast and efficient. I will always call Fred’s Plumbing",
    date: "September 2025",
    source: "google",
    reviewerMeta: "8 reviews",
    ownerReply:
      "Thank you so much for your kind words and for taking the time to leave a review! We truly appreciate your support and are thrilled to hear you had a great experience with Fred’s Plumbing. Our team works hard to provide reliable, efficient, and honest service, especially for our multifamily property partners and it means a lot to know it’s making a difference. We look forward to helping you again whenever you need us! — The Fred’s Plumbing Team",
    ownerReplyDate: "9 months ago",
  },
  {
    id: "g-d95ee00491",
    name: "Daniel Hernandez",
    rating: 5,
    quote:
      "Thank you Fred G. Communicative every step of the way and the man knew his stuff. Thank you from Soverign Hometown.",
    date: "August 2025",
    source: "google",
    reviewerMeta: "11 reviews",
    ownerReply:
      "Thank you, Daniel! We are grateful of you supporting our small business!",
    ownerReplyDate: "11 months ago",
  },
  {
    id: "g-b2e2293517",
    name: "Hannah Barrow",
    rating: 5,
    quote:
      "My community loves using Fred’s! Trey is always a big help, getting things done and always explains his work! 10/10",
    date: "July 2025",
    source: "google",
    reviewerMeta: "7 reviews",
    ownerReply:
      "Thank you for your kind words, and thank you for allowing us to service you.",
    ownerReplyDate: "a year ago",
  },
  {
    id: "g-38c078aec6",
    name: "Victoria Dubon",
    rating: 5,
    quote:
      "Love, love, LOVE the entire team, from the office to the plumbers, I can always count on them to take care of my plumbing needs. Stephanie and Leighanne are always so kind and quick to assist getting a plumber out to me or answering my invoicing questions. While they have lots of great plumbers, Tony is unmatched! He is kind, quick, and diligent in what he does. He is always my first request, and always does great work. No body likes to have to call a Plumber, but Fred's makes it as painless as possible!",
    date: "July 2025",
    source: "google",
    reviewerMeta: "Local Guide · 93 reviews",
    ownerReply:
      "Thank you Victoria for your kind words. I hope you HAVE A GREAT DAY!",
    ownerReplyDate: "a year ago",
  },
];
