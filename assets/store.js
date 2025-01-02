

var createStore = Framework7.createStore;
const store = createStore({
  state: {
    products: [
            {
    "id": "1",
    "title": "Phishing Scams",
    "img":"https://www.vadesecure.com/hubfs/Email-Scams_Phishing-for-Victims-in-Election-Year-1200x800.jpg",
    "description": "Cybercriminals send deceptive emails or messages that appear to be from legitimate sources, tricking individuals into revealing sensitive information like passwords or credit card numbers.",
    "longDescription": "Phishing scams can happen to anyone. One day, Alice, a diligent employee, received an email seemingly from her bank. The message stated there was suspicious activity on her account and requested her to click a link to verify her credentials. Alarmed, she clicked the link and entered her login information. Unbeknownst to her, it was a phishing scam. The attackers gained access to her bank account and stole her savings. Alice's story serves as a stark reminder of how convincing phishing emails can be and how anyone can fall prey to them.",
    "count":7097,
    "identify": [
      "Check the sender's email address for inconsistencies or misspellings.",
      "Hover over links in emails to preview the actual URL before clicking.",
      "Be cautious when asked to provide sensitive information via email.",
      "Verify the authenticity of requests with the organization directly."
    ]
  },
  {
    "id": "2",
    "title": "Tech Support Scams",
    "img":"https://1.bp.blogspot.com/-Xm0IJFvXgsg/XM1blyo3I-I/AAAAAAAAEI8/B7BmCHzIPvwGTl72I9qt0PfkcngefbxZgCLcBGAs/s1600/tech-support-scam.jpg",
    "description": "Scammers impersonate tech support representatives from reputable companies, claiming there's a problem with the victim's computer and demanding payment for fixing it.",
    "longDescription": "Tech support scams can victimize even the most cautious individuals. Sarah, a retiree, received a call from someone claiming to be a Microsoft support technician. They convinced her that her computer was infected with a virus and needed immediate repair. To resolve the issue, they demanded a substantial fee. Worried about her personal data, Sarah complied and paid the scammers. Unfortunately, her computer was never infected, and she had fallen for a tech support scam. Sarah's story highlights the need for verifying the authenticity of unsolicited tech support calls.",
    "count":6492,
    "identify": [
      "Legitimate tech support services won't cold call you; they wait for you to reach out.",
      "Don't grant remote access to your computer to unsolicited callers.",
      "Verify the caller's identity by independently searching for the company's contact information."
    ]
  },
  {
    "id": "3",
    "title": "Online Shopping Scams",
    "img":"https://australiancybersecuritymagazine.com.au/wp-content/uploads/2021/11/img_A-ScamWatch-Alert.jpg",
    "description": "Fake online stores offer products at incredibly low prices, often taking payment without delivering any goods or providing counterfeit products.",
    "longDescription": "Online shopping scams can target anyone searching for a good deal. Michael, an enthusiastic online shopper, stumbled upon a website offering high-end electronics at unbelievably low prices. Excited, he placed an order but never received the products. The online store vanished, and Michael realized he had fallen victim to an online shopping scam. His story serves as a warning that even savvy shoppers can be deceived by fraudulent online stores.",
    "count":4762,
    "identify": [
      "Research the online store's reputation and reviews before making a purchase.",
      "Be wary of prices that seem too good to be true.",
      "Check for secure payment options and a valid contact address on the website."
    ]
  },
  {
    "id": "4",
    "title": "Romance Scams",
    "img":"https://dfpi.ca.gov/wp-content/uploads/sites/337/2023/02/Shutterstock_1918234223-1.jpg",
    "description": "Fraudsters create fake online personas to establish romantic relationships with victims, eventually asking for money or personal information under false pretenses.",
    "longDescription": "Romance scams are a threat to anyone seeking love online. Rebecca, a single professional, met 'Alex' on a dating site. Over time, they developed a deep connection, and 'Alex' shared stories of financial hardship. Wanting to help, Rebecca sent 'Alex' a significant sum of money. However, 'Alex' was a fictitious character created by a romance scammer. Rebecca's story is a heartbreaking example of how emotional vulnerability can be exploited in online scams.",
    "count":3108,
    "identify": [
      "Be cautious of individuals who quickly profess love and request financial assistance.",
      "Avoid sending money to someone you've never met in person.",
      "Use reverse image searches to check if profile pictures are stolen from elsewhere."
    ]
  },
  {
    "id": "5",
    "title": "Investment/Fake ICO Scams",
    "img":"https://saitsa.com/wp-content/uploads/brizy/imgs/Untitled-design-2023-03-06T140344.173-2340x1961x0x102x2340x1756x1678140254.png",
    "description": "Individuals are lured into investing in fake or non-existent cryptocurrencies or initial coin offerings (ICOs), resulting in financial losses.",
    "longDescription": "Investment scams can ensnare even the most financially savvy individuals. James, an experienced cryptocurrency enthusiast, came across an ICO promising astronomical returns. Excited about the opportunity, he invested a substantial amount. However, the ICO was a scam, and James lost his entire investment. His story underscores the importance of thorough research and due diligence in the world of cryptocurrency investments.",
    "count":2106,
    "identify": [
      "Beware of investment opportunities that promise unrealistically high returns.",
      "Research the company or project thoroughly before investing.",
      "Seek advice from trusted financial experts."
    ]
  },
  {
    "id": "6",
    "title": "IRS or Tax Scams",
    "img":"https://i2.cdn.turner.com/money/dam/assets/150122071202-dirty-dozen-irs-scam-1-640x640.jpg",
    "description": "Scammers impersonate tax authorities and threaten victims with legal action or arrest if they don't pay alleged back taxes immediately.",
    "longDescription": "IRS scams can target anyone, regardless of their tax history. Kevin, a law-abiding citizen, received a call from someone claiming to be from the IRS. They asserted he owed back taxes and would face immediate legal consequences if he didn't pay. Panicked, Kevin complied and transferred a substantial sum. Later, he discovered it was an IRS scam, and he had fallen victim to the fraud. Kevin's story underscores the importance of verifying tax-related calls with official sources.",
    "count":1696,
    "identify": [
      "The IRS typically contacts individuals through official letters, not unsolicited phone calls.",
      "Don't make payments or share personal information over the phone without verifying the caller's identity.",
      "Contact the IRS directly using official contact information to confirm any tax-related issues."
    ]
  },
  {
    "id": "7",
    "title": "Lottery or Prize Scams",
        "img":"https://blog.avast.com/hubfs/lottery_scams.2.jpg",
    "description": "Victims receive notifications claiming they've won a lottery or prize and are asked to pay fees or provide personal information to claim their winnings.",
    "longDescription": "Lottery scams can deceive anyone in pursuit of good fortune. Emily received an email stating she had won a luxury vacation in a lottery she never entered. To claim the prize, she was asked to pay a processing fee upfront. Eager for the vacation, Emily paid the fee but never received any prize. It was a lottery scam, and Emily learned that legitimate lotteries never require upfront payments.",
    "count":1031,
    "identify": [
      "Be cautious of unexpected lottery or prize notifications.",
      "Legitimate lotteries don't require upfront payments to claim winnings.",
      "Verify the legitimacy of the organization running the lottery."
    ]
  },
  {
    "id": "8",
    "title": "Social Engineering Scams",
        "img":"https://www.harbortg.com/hubfs/csm_socialengineering_grn_a5d92ecb20.png",
    "description": "Attackers manipulate individuals through social media, phone calls, or in-person interactions to gain access to their personal or financial information.",
    "longDescription": "Social engineering scams can target anyone, exploiting trust. Robert, a diligent professional, received a message from a colleague on social media, requesting sensitive work-related information. Trusting the source, he shared the data. Later, he discovered his colleague's account had been hacked, and he had fallen for a social engineering scam. Robert's story emphasizes the importance of verifying unusual requests through alternate means of communication.",
    "count":868,
    "identify": [
      "Be cautious of requests for sensitive information, even from seemingly trusted sources.",
      "Verify the authenticity of requests through a secondary communication method.",
      "Educate yourself and your colleagues about common social engineering tactics."
    ]
  },
  {
    "id": "9",
    "title": "Ransomware Attacks",
        "img":"https://www.avepoint.com/blog/wp-content/uploads/2021/06/businessman-hand-holding-money-banknote-for-paying-the-key-from-for-vector-id681203088-696x493.jpg",
    "description": "Malicious software encrypts a victim's data, and attackers demand a ransom in exchange for the decryption key, with no guarantee they will provide it even if paid.",
    "longDescription": "Ransomware attacks can happen to anyone using a computer. Linda, a small business owner, fell victim when her company's computers were infected. Desperate to regain access to critical business data, she paid the ransom. However, the attackers never provided the decryption key, leaving Linda with data loss and financial damage. Her story underscores the importance of robust cybersecurity measures to prevent ransomware attacks.",
    "count":771,
    "identify": [
      "Regularly back up your data to avoid losing it in a ransomware attack.",
      "Be cautious of suspicious email attachments or links, which can be the entry point for ransomware.",
      "Consider using reputable cybersecurity software to protect your devices."
    ]
  },
  {
    "id": "10",
    "title": "Job or Work-from-Home Scams",
    "img":"https://media.kasperskydaily.com/wp-content/uploads/sites/102/2023/01/24000632/2023-job-scams-and-how-to-avoid-them-featured-1500x986.jpg",
    "description": "Fake job offers promise high pay for minimal work or request an upfront fee for job placement services, ultimately resulting in financial loss.",
    "longDescription": "Job scams can affect anyone searching for employment. Alex, a recent college graduate, was thrilled to find a job offer that promised substantial pay for working from home. However, the job required an upfront fee for training materials. Eager to kickstart his career, Alex paid the fee but never received any materials or heard from the company again. Alex had fallen for a job scam, a stark reminder of the dangers of job offers that ask for upfront payments.",
    "count":626,
    "identify": [ 
      "Be cautious of job offers that promise high pay for minimal work or ask for upfront fees.",
      "Research the company and job offer thoroughly before making any payments or commitments.",
      "Consult trusted job search platforms and employment agencies for legitimate opportunities."
    ] 
  }
    ],
  },
  getters: {
    products({ state }) {
      return state.products;
    }
  },
  actions: {
    addProduct({ state }, product) {
      state.products = [...state.products, product];
    },
  },
})

