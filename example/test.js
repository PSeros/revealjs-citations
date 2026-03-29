import Cite from "citation-js";

const sources = [
  {
    id: "s1",
    type: "article",
    abstract:
      'L$_2$ regularization and weight decay regularization are equivalent for standard stochastic gradient descent (when rescaled by the learning rate), but as we demonstrate this is \\emph{not} the case for adaptive gradient algorithms, such as Adam. While common implementations of these algorithms employ L$_2$ regularization (often calling it "weight decay" in what may be misleading due to the inequivalence we expose), we propose a simple modification to recover the original formulation of weight decay regularization by \\emph{decoupling} the weight decay from the optimization steps taken w.r.t. the loss function. We provide empirical evidence that our proposed modification (i) decouples the optimal choice of weight decay factor from the setting of the learning rate for both standard SGD and Adam and (ii) substantially improves Adam\'s generalization performance, allowing it to compete with SGD with momentum on image classification datasets (on which it was previously typically outperformed by the latter). Our proposed decoupled weight decay has already been adopted by many researchers, and the community has implemented it in TensorFlow and PyTorch; the complete source code for our experiments is available at https://github.com/loshchil/AdamW-and-SGDW',
    DOI: "10.48550/ARXIV.1711.05101",
    license: "arXiv.org perpetual, non-exclusive license",
    note: "version: 3",
    publisher: "arXiv",
    source: "DOI.org (Datacite)",
    title: "Decoupled Weight Decay Regularization",
    URL: "https://arxiv.org/abs/1711.05101",
    author: [
      {
        family: "Loshchilov",
        given: "Ilya",
      },
      {
        family: "Hutter",
        given: "Frank",
      },
    ],
    accessed: {
      "date-parts": [["2025", 7, 10]],
    },
    issued: {
      "date-parts": [["2017"]],
    },
  },
  {
    id: "s2",
    type: "article",
    abstract:
      "We introduce Adam, an algorithm for first-order gradient-based optimization of stochastic objective functions, based on adaptive estimates of lower-order moments. The method is straightforward to implement, is computationally efficient, has little memory requirements, is invariant to diagonal rescaling of the gradients, and is well suited for problems that are large in terms of data and/or parameters. The method is also appropriate for non-stationary objectives and problems with very noisy and/or sparse gradients. The hyper-parameters have intuitive interpretations and typically require little tuning. Some connections to related algorithms, on which Adam was inspired, are discussed. We also analyze the theoretical convergence properties of the algorithm and provide a regret bound on the convergence rate that is comparable to the best known results under the online convex optimization framework. Empirical results demonstrate that Adam works well in practice and compares favorably to other stochastic optimization methods. Finally, we discuss AdaMax, a variant of Adam based on the infinity norm.",
    DOI: "10.48550/ARXIV.1412.6980",
    license: "arXiv.org perpetual, non-exclusive license",
    note: "version: 9",
    publisher: "arXiv",
    source: "DOI.org (Datacite)",
    title: "Adam: A Method for Stochastic Optimization",
    "title-short": "Adam",
    URL: "https://arxiv.org/abs/1412.6980",
    author: [
      {
        family: "Kingma",
        given: "Diederik P.",
      },
      {
        family: "Ba",
        given: "Jimmy",
      },
    ],
    accessed: {
      "date-parts": [["2025", 7, 10]],
    },
    issued: {
      "date-parts": [["2014"]],
    },
  },
];

function formatCitation(items, style, locale, mode = "narrative") {
  if (mode === "narrative") {
    return items
      .map((item) => {
        const cite = new Cite([item]);
        const authorOnly = String(
          cite.format("citation", {
            template: style,
            lang: locale,
            format: "text",
            entry: [{ id: item.id, "author-only": true }],
          }),
        )
          .trim()
          .replace(/[;,]\s*$/g, "");

        const suppressAuthor = String(
          cite.format("citation", {
            template: style,
            lang: locale,
            format: "text",
            entry: [{ id: item.id, "suppress-author": true }],
          }),
        ).trim();

        return `${authorOnly} ${suppressAuthor}`.trim();
      })
      .join("; ");
  }

  const cite = new Cite(items);
  return String(
    cite.format("citation", {
      template: style,
      lang: locale,
      format: "text",
    }),
  ).trim();
}

function formatFootnoteCitation(item, style, locale) {
  const inline = formatCitation([item], style, locale, "narrative").trim();
  return inline.replace(/^\((.*)\)$/s, "$1").trim();
}

function formatBibliographyEntry(item, style, locale) {
  const cite = new Cite(item);
  return String(
    cite.format("bibliography", {
      template: style,
      lang: locale,
      format: "text",
    }),
  )
    .replace(/^[\s\n]+|[\s\n]+$/g, "")
    .replace(/^\d+\.\s*/, "");
}

function formatBibliographyHtml(items, style, locale) {
  const cite = new Cite(items);
  return cite.format("bibliography", {
    template: style,
    lang: locale,
    format: "html",
  });
}

console.log("=== Test 1: Narrative Zitate ===");
console.log(formatCitation(sources, "apa", "en-US", "narrative"));

console.log("\n=== Test 2: Parenthetische Zitate ===");
console.log(formatCitation(sources, "apa", "en-US", "parenthetical"));

console.log("\n=== Test 3: Fußnotenzitat ===");
console.log(formatFootnoteCitation(sources[0], "apa", "en-US"));
console.log(formatFootnoteCitation(sources[1], "apa", "en-US"));

console.log("\n=== Test 4: Bibliographie-Eintrag (Buch) ===");
console.log(formatBibliographyEntry(sources[0], "apa", "en-US"));

console.log("\n=== Test 5: Bibliographie-Eintrag (Artikel) ===");
console.log(formatBibliographyEntry(sources[1], "apa", "en-US"));

console.log("\n=== Test 6: Bibliographie als HTML ===");
console.log(formatBibliographyHtml(sources, "apa", "en-US"));
