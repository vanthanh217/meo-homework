/* Câu hỏi theo định hướng ôn tập GK1; đáp án theo docs/Dap_an_on_tap_Sinh_12_GK1.md. */
(function () {
  function acceptsNumber(expected) {
    return function (raw) {
      const cleaned = String(raw).replace(/(\d)[.,](?=\d{3}(?!\d))/g, "$1");
      const nums = cleaned.match(/\d+/g) || [];
      if (nums.length === 0) return false;
      if (nums.length === 1) return nums[0] === String(expected);
      return nums[nums.length - 1] === String(expected);
    };
  }

  const lessons = [
    {
      id: "b1",
      index: 1,
      title: "DNA và cơ chế tái bản DNA",
      questions: [
        {
          id: "1-I-1",
          n: 1,
          part: "I",
          type: "mcq",
          letter: "D",
          images: [
            {
              src: "assests/figures/b1-cau1-nucleotide.jpeg",
              alt: "Nucleotide gồm nhóm phosphate, đường deoxyribose và adenine",
            },
          ],
          prompt:
            "Cho hình vẽ cấu tạo của một nucleotide. Nucleotide này là đơn phân của phân tử nào?",
          options: ["mRNA.", "tRNA.", "rRNA.", "DNA."],
          correct: 3,
          explain:
            "Hình ghi đường deoxyribose và base adenine. Đường deoxyribose là dấu hiệu của DNA; RNA dùng đường ribose. Nucleotide này là đơn phân của DNA.",
        },
        {
          id: "1-I-2",
          n: 2,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Cho một đoạn mạch gốc của gene chỉ chứa 3 loại nucleotide adenine, guanine, cytosine. Trong điều kiện không có đột biến, mạch bổ sung của gene không có loại nucleotide nào sau đây?",
          options: ["Thymine.", "Adenine.", "Guanine.", "Cytosine."],
          correct: 1,
          explain:
            "Mạch gốc có A, G, C thì mạch bổ sung có T, C, G. Mạch bổ sung không có adenine.",
        },
        {
          id: "1-I-3",
          n: 3,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Liên kết nối giữa các nucleotide trong một mạch DNA tạo nên chuỗi polynucleotide là liên kết",
          options: ["peptide.", "phosphodiester.", "ion.", "hydrogen."],
          correct: 1,
          explain:
            "Các nucleotide trên một mạch DNA nối với nhau bằng liên kết phosphodiester. Liên kết hydrogen nối hai mạch với nhau.",
        },
        {
          id: "1-I-4",
          n: 4,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Trong quá trình nhân đôi DNA, enzyme xúc tác nối các đoạn Okazaki là",
          options: ["RNA polymerase.", "restrictase.", "ligase.", "DNA polymerase."],
          correct: 2,
          explain: "DNA ligase nối các đoạn Okazaki thành mạch liên tục.",
        },
        {
          id: "1-I-5",
          n: 5,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Khi nói về quá trình tái bản DNA, phát biểu nào sau đây là sai?",
          options: [
            "Nhờ các enzyme tháo xoắn, hai mạch đơn của DNA tách nhau dần tạo nên chạc chữ Y.",
            "Quá trình tái bản DNA diễn ra theo nguyên tắc bổ sung và nguyên tắc bán bảo toàn.",
            "Enzyme DNA polymerase tổng hợp và kéo dài mạch mới theo chiều 3’ → 5’.",
            "Enzyme ligase nối các đoạn Okazaki thành mạch đơn mới hoàn chỉnh.",
          ],
          correct: 2,
          explain:
            "DNA polymerase tổng hợp mạch mới theo chiều 5’ → 3’, không phải 3’ → 5’. Phát biểu C là sai.",
        },
        {
          id: "1-I-6",
          n: 6,
          part: "I",
          type: "mcq",
          letter: "C",
          images: [
            {
              src: "assests/figures/b1-cau6-replication.jpeg",
              alt: "Bốn sơ đồ chạc chữ Y trong tái bản DNA",
            },
          ],
          prompt:
            "Sơ đồ nào sau đây mô tả đúng về giai đoạn kéo dài mạch polynucleotide mới trên một chạc chữ Y trong quá trình tái bản DNA ở sinh vật nhân sơ?",
          options: ["Sơ đồ I.", "Sơ đồ II.", "Sơ đồ III.", "Sơ đồ IV."],
          correct: 2,
          explain:
            "DNA polymerase chỉ kéo dài mạch mới theo chiều 5’ → 3’. Ở sơ đồ III, mạch khuôn phía trên có 3’ ở phía chạc và 5’ ở đầu mút, nên mạch mới chạy ra phía đầu mút; mạch khuôn phía dưới ngược lại, nên mạch mới chạy về phía chạc. Một mạch tiến về phía chạc đang mở, mạch kia đi ngược lại. Các sơ đồ còn lại cho hai mạch cùng chiều hoặc ngược quy tắc 5’ → 3’.",
        },
        {
          id: "1-I-7",
          n: 7,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Cho biết các sự kiện sau đây xảy ra trong quá trình tự nhân đôi của DNA:\n(1) Enzyme nối ligase nối các đoạn Okazaki để tạo thành mạch liên tục.\n(2) Nhờ các enzyme tháo xoắn, phân tử DNA được tách ra tạo chạc chữ Y.\n(3) Hình thành nên hai phân tử DNA con, mỗi phân tử chứa một mạch cũ của DNA ban đầu và một mạch mới.\n(4) Enzyme DNA polymerase dựa trên mạch khuôn của DNA để tổng hợp mạch mới theo nguyên tắc bổ sung.\nThứ tự đúng của các sự kiện trên là:",
          options: [
            "(1) → (2) → (4) → (3).",
            "(2) → (4) → (3) → (1).",
            "(2) → (4) → (1) → (3).",
            "(2) → (1) → (4) → (3).",
          ],
          correct: 2,
          explain:
            "Thứ tự: tháo xoắn, tách mạch (2) → tổng hợp mạch mới (4) → nối các đoạn Okazaki (1) → hình thành hai DNA con (3).",
        },
        {
          id: "1-I-8",
          n: 8,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Trong các phát biểu sau, có bao nhiêu phát biểu đúng về DNA ở tế bào nhân thực?\n(1) DNA tồn tại ở cả trong nhân và trong tế bào chất.\n(2) Các tác nhân đột biến chỉ tác động lên DNA trong nhân tế bào mà không tác động lên DNA trong tế bào chất.\n(3) Các phân tử DNA trong nhân tế bào có cấu trúc kép, mạch thẳng còn các phân tử DNA trong tế bào chất có cấu trúc kép, mạch vòng.\n(4) Khi tế bào giảm phân, hàm lượng DNA trong nhân và hàm lượng DNA trong tế bào chất của giao tử luôn giảm đi một nửa so với tế bào ban đầu.",
          options: ["3.", "1.", "2.", "4."],
          correct: 2,
          explain:
            "Đúng (1) và (3): DNA nhân thực có ở nhân và ở ti thể, lục lạp; DNA nhân thường mạch thẳng, DNA bào quan thường mạch vòng. (2) sai vì tác nhân đột biến cũng tác động được lên DNA ngoài nhân. (4) sai vì không thể kết luận DNA tế bào chất của giao tử luôn giảm đúng một nửa.",
        },
        {
          id: "1-I-9",
          n: 9,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt:
            "Một mạch đơn của phân tử DNA có trình tự các nucleotide như sau: ….ATGCATGGCCGC….\nTrong quá trình tái bản, DNA mới được hình thành từ đoạn mạch này sẽ có trình tự:",
          options: [
            "….TACGTACCGGCG….",
            "….ATGCATGGCCGC….",
            "….UACGUACCGGCG….",
            "….ATGCGTACCGGCT….",
          ],
          correct: 0,
          explain:
            "Theo nguyên tắc bổ sung A–T, T–A, G–C, C–G, mạch mới là TACGTACCGGCG. DNA không chứa uracil.",
        },
        {
          id: "1-I-10",
          n: 10,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Quá trình tự nhân đôi của DNA có các đặc điểm:\n(1) Ở sinh vật nhân thực diễn ra trong nhân tế bào, tại pha G1 của kì trung gian.\n(2) Đoạn Okazaki được tổng hợp theo chiều 5’ → 3’.\n(3) Ở sinh vật nhân thực có nhiều đơn vị tái bản, trong mỗi đơn vị lại có nhiều điểm sao chép.\n(4) Ở sinh vật nhân thực, enzyme nối ligase thực hiện trên cả 2 mạch mới.\n(5) Quá trình tự nhân đôi là cơ sở dẫn tới hiện tượng nhân bản gene trong ống nghiệm.\nSố phương án đúng là:",
          options: ["3.", "2.", "4.", "5."],
          correct: 1,
          explain:
            "Đúng (2) và (5). (1) sai vì tái bản diễn ra ở pha S, không phải G1. (3) sai vì mỗi đơn vị tái bản có một điểm khởi đầu. (4) không được lấy làm phát biểu đúng: ligase nối các đoạn Okazaki trên mạch tổng hợp gián đoạn.",
        },
        {
          id: "1-II-1",
          n: 1,
          part: "II",
          type: "tf",
          context:
            "Enzyme DNA polymerase trượt trên mạch khuôn theo chiều 3’ – 5’ để tổng hợp DNA mới theo nguyên tắc bổ sung có chiều 5’ – 3’. Các enzyme này lắp các nucleotide, cần cho tái bản và thường làm việc theo hai nhóm để tạo hai DNA con từ một DNA mẹ.",
          lead: "Mỗi nhận định dưới đây là Đúng hay Sai về enzyme DNA polymerase?",
          items: [
            {
              text: "Enzyme DNA polymerase bẻ gãy các liên kết hydrogen giữa hai mạch DNA.",
              correct: false,
              explain:
                "Sai. Enzyme tháo xoắn (helicase) tách hai mạch. Đó không phải chức năng chính của DNA polymerase.",
            },
            {
              text: "Enzyme DNA polymerase lắp ráp các nucleotide theo nguyên tắc bổ sung với mạch khuôn của DNA.",
              correct: true,
              explain: "Đúng. Polymerase lắp nucleotide bổ sung với mạch khuôn.",
            },
            {
              text: "Sinh vật nhân thực có ít loại polymerase hơn so với sinh vật nhân sơ.",
              correct: false,
              explain:
                "Sai. Sinh vật nhân thực có nhiều loại DNA polymerase chuyên hóa hơn sinh vật nhân sơ.",
            },
            {
              text: "Trong quá trình tái bản, DNA polymerase đọc từng sợi khuôn của DNA mẹ hiện có để tạo hai mạch mới, khớp theo nguyên tắc bổ sung với từng mạch khuôn.",
              correct: true,
              explain: "Đúng. Mỗi mạch mẹ làm khuôn cho một mạch mới bổ sung.",
            },
          ],
        },
        {
          id: "1-II-2",
          n: 2,
          part: "II",
          type: "tf",
          lead: "Khi nói về tái bản DNA ở tế bào nhân thực, mỗi nhận định sau đây là Đúng hay Sai?",
          items: [
            {
              text: "Trong quá trình tái bản DNA, có sự liên kết bổ sung giữa A với T, G với C và ngược lại.",
              correct: true,
              explain: "Đúng. A bắt cặp với T, G bắt cặp với C.",
            },
            {
              text: "Sự tái bản DNA xảy ra ở nhiều điểm trong mỗi phân tử DNA, tạo ra nhiều đơn vị tái bản.",
              correct: true,
              explain:
                "Đúng. DNA nhân thực có nhiều điểm khởi đầu, tạo nhiều đơn vị tái bản.",
            },
            {
              text: "Nếu không có enzyme hay protein tháo xoắn thì quá trình tái bản sẽ dẫn đến đột biến.",
              correct: false,
              explain:
                "Sai. Thiếu protein tháo xoắn thì tái bản có thể đình trệ; không kết luận được rằng chắc chắn sẽ gây đột biến.",
            },
            {
              text: "Trong quá trình tái bản DNA, enzyme nối ligase chỉ tác động lên một trong hai mạch đơn mới được tổng hợp từ một phân tử DNA mẹ.",
              correct: false,
              explain:
                "Sai. Ligase nối các đoạn Okazaki trên mạch tổng hợp gián đoạn; không khái quát thành quy tắc tuyệt đối rằng enzyme này chỉ tác động một mạch trong mọi trường hợp.",
            },
          ],
        },
        {
          id: "1-III-1",
          n: 1,
          part: "III",
          type: "short",
          prompt:
            "Cho các enzyme: RNA polymerase, aminoacyl-tRNA synthetase, DNA polymerase, DNA ligase và restrictase. Trong các enzyme trên, có bao nhiêu loại tham gia vào quá trình tái bản DNA trong nhân tế bào sinh vật nhân thực?",
          sample: "2",
          grade: acceptsNumber(2),
          reject: ["5", "3", "1"],
          explain:
            "Có 2 loại: DNA polymerase và DNA ligase. RNA polymerase ở danh sách này không phải enzyme tái bản, aminoacyl-tRNA synthetase tham gia dịch mã, restrictase không thuộc bộ máy tái bản trong nhân.",
        },
        {
          id: "1-III-2",
          n: 2,
          part: "III",
          type: "short",
          prompt:
            "Ở tế bào sinh vật nhân thực, từ một phân tử DNA qua 3 lần tái bản liên tục tạo ra số phân tử DNA con là bao nhiêu?",
          sample: "8",
          grade: acceptsNumber(8),
          reject: ["6", "3", "16"],
          explain: "Sau mỗi lần tái bản, số phân tử tăng gấp đôi: 2³ = 8.",
        },
      ],
    },
    {
      id: "b2",
      index: 2,
      title: "Gene, hệ gene và truyền đạt thông tin di truyền",
      questions: [
        {
          id: "2-I-1",
          n: 1,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Một đoạn của phân tử DNA mang thông tin mã hóa cho một chuỗi polypeptide hay một phân tử RNA được gọi là",
          options: ["anticodon.", "gene.", "codon.", "mã di truyền."],
          correct: 1,
          explain:
            "Đoạn DNA mang thông tin mã hóa polypeptide hoặc RNA là gene.",
        },
        {
          id: "2-I-2",
          n: 2,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Loại RNA nào làm khuôn cho quá trình dịch mã?",
          options: ["mRNA.", "tRNA.", "rRNA.", "DNA."],
          correct: 0,
          explain: "mRNA là khuôn trong dịch mã.",
        },
        {
          id: "2-I-3",
          n: 3,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Hệ gene gồm tập hợp",
          options: [
            "các exon trong tế bào của một sinh vật.",
            "các exon và intron trong tế bào của một sinh vật.",
            "các DNA trong tế bào của một sinh vật.",
            "các exon quy định protein và các vùng mã hóa quy định rRNA, tRNA.",
          ],
          correct: 2,
          explain:
            "Theo cách diễn đạt của câu hỏi, hệ gene là toàn bộ DNA trong tế bào của sinh vật.",
        },
        {
          id: "2-I-4",
          n: 4,
          part: "I",
          type: "mcq",
          letter: "D",
          prompt: "Bản chất mối quan hệ DNA – RNA – protein là:",
          options: [
            "Trình tự amino acid – trình tự nucleotide – trình tự ribonucleotide.",
            "Trình tự ribonucleotide – trình tự nucleotide – trình tự amino acid.",
            "Trình tự amino acid – trình tự ribonucleotide – trình tự nucleotide.",
            "Trình tự nucleotide – trình tự ribonucleotide – trình tự amino acid.",
          ],
          correct: 3,
          explain:
            "Thông tin truyền theo trình tự nucleotide của DNA → ribonucleotide của RNA → amino acid của protein.",
        },
        {
          id: "2-I-5",
          n: 5,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt:
            "Gene và protein có mối quan hệ với nhau thông qua cấu trúc không gian nào?",
          options: ["mRNA.", "tRNA.", "rRNA.", "DNA."],
          correct: 0,
          explain:
            "mRNA truyền thông tin từ gene tới quá trình tổng hợp protein.",
        },
        {
          id: "2-I-6",
          n: 6,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Mỗi gene mã hóa protein điển hình có 3 vùng trình tự nucleotide. Vùng trình tự nucleotide nằm ở đầu 5’ trên mạch mã gốc của gene có chức năng",
          options: [
            "mang tín hiệu kết thúc quá trình dịch mã.",
            "mang tín hiệu kết thúc quá trình phiên mã.",
            "mang tín hiệu mở đầu quá trình phiên mã.",
            "mang tín hiệu mở đầu quá trình dịch mã.",
          ],
          correct: 2,
          explain:
            "Theo cách diễn đạt của đề, vùng đầu 5’ của mạch mã gốc gắn với tín hiệu mở đầu phiên mã.",
        },
        {
          id: "2-I-7",
          n: 7,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Khi nói về mã di truyền, có bao nhiêu phát biểu sau đây đúng?\n(1) Codon quy định tín hiệu kết thúc quá trình dịch mã là 5’UAG 3’.\n(2) Trong 64 loại bộ mã di truyền có 3 bộ ba không mã hóa amino acid.\n(3) Ở sinh vật nhân thực, bộ ba mở đầu 5’AUG 3’ mã hóa amino acid mở đầu methionine.\n(4) Codon là 3 nucleotide kế tiếp nhau trên tRNA tạo thành.",
          options: ["1.", "2.", "3.", "4."],
          correct: 2,
          explain:
            "Đúng (1), (2), (3). (4) sai: codon nằm trên mRNA; bộ ba trên tRNA là anticodon.",
        },
        {
          id: "2-I-8",
          n: 8,
          part: "I",
          type: "mcq",
          letter: "A",
          table: {
            caption: "Mức độ giống nhau về DNA của người với một số loài thuộc bộ khỉ",
            headers: ["Loài", "% giống"],
            rows: [
              ["Tinh tinh", "97,6"],
              ["Vượn Gibbon", "94,7"],
              ["Khỉ Rhesus", "91,1"],
              ["Khỉ Vervet", "90,5"],
              ["Khỉ Capuchin", "84,2"],
              ["Galago", "58"],
            ],
          },
          prompt:
            "Dựa vào bảng trên, loài nào có quan hệ họ hàng gần và xa với người nhất?",
          options: [
            "Tinh tinh; Galago.",
            "Tinh tinh; khỉ Capuchin.",
            "Vượn Gibbon; khỉ Vervet.",
            "Vượn Gibbon; khỉ Rhesus.",
          ],
          correct: 0,
          explain:
            "Tinh tinh có 97,6% DNA giống người, gần nhất. Galago có 58%, xa nhất.",
        },
        {
          id: "2-I-9",
          n: 9,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Sự giống nhau giữa DNA, RNA và protein là\n(1) Đều là các đại phân tử, có kích thước và khối lượng lớn trong tế bào.\n(2) Đều cấu tạo theo nguyên tắc đa phân, gồm các đơn phân.\n(3) Đều cấu tạo từ nhiều hợp chất hữu cơ.\n(4) Giữa các đơn phân đều có liên kết cộng hóa trị và liên kết hydrogen.\n(5) Tính đa dạng và đặc thù do thành phần, số lượng và trật tự của các đơn phân quy định.",
          options: [
            "1, 2 và 3.",
            "1, 2, 4 và 5.",
            "1, 2 và 5.",
            "1, 2, 3, 4 và 5.",
          ],
          correct: 2,
          explain:
            "Các điểm chung đúng là (1), (2) và (5). Liên kết hydrogen không phải đặc điểm chung giữa mọi đơn phân của cả ba đại phân tử, nên (4) loại.",
        },
        {
          id: "2-I-10",
          n: 10,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt:
            "Cho biết các codon: GGG – Gly; CCC – Pro; GCU – Ala; CGA – Arg; UCG – Ser; AGC – Ser. Một đoạn mạch gốc của một gene ở vi khuẩn có trình tự 5’ AGCCGACCCGGG 3’. Nếu đoạn mạch gốc này mã hóa cho đoạn polypeptide có 4 amino acid thì trình tự 4 amino acid đó là",
          options: [
            "Pro–Gly–Ser–Ala.",
            "Ser–Ala–Gly–Pro.",
            "Gly–Pro–Ser–Arg.",
            "Ser–Arg–Pro–Gly.",
          ],
          correct: 0,
          explain:
            "Mạch gốc 5’ AGCCGACCCGGG 3’ cho mRNA 5’ CCCGGGUCGGCU 3’. Bốn codon CCC, GGG, UCG, GCU mã hóa Pro–Gly–Ser–Ala.",
        },
        {
          id: "2-II-1",
          n: 1,
          part: "II",
          type: "tf",
          lead: "Nói về quá trình dịch mã, các nhận định dưới đây là Đúng hay Sai?",
          items: [
            {
              text: "Dịch mã là quá trình tổng hợp protein, quá trình này chỉ diễn ra trong nhân của tế bào nhân thực.",
              correct: false,
              explain:
                "Sai. Ở sinh vật nhân thực, dịch mã diễn ra tại ribosome trong tế bào chất, không chỉ trong nhân.",
            },
            {
              text: "Quá trình dịch mã có thể chia thành hai giai đoạn là hoạt hóa amino acid và tổng hợp chuỗi polypeptide.",
              correct: true,
              explain:
                "Đúng. Gồm hoạt hóa amino acid và tổng hợp chuỗi polypeptide.",
            },
            {
              text: "Trong quá trình dịch mã, trên mỗi phân tử mRNA thường có một số ribosome cùng hoạt động.",
              correct: true,
              explain: "Đúng. Nhiều ribosome có thể cùng dịch một mRNA.",
            },
            {
              text: "Quá trình dịch mã kết thúc khi ribosome tiếp xúc với codon 5’ UUG 3’ trên phân tử mRNA.",
              correct: false,
              explain:
                "Sai. Các codon kết thúc là UAA, UAG và UGA. UUG không phải codon kết thúc.",
            },
          ],
        },
        {
          id: "2-II-2",
          n: 2,
          part: "II",
          type: "tf",
          lead: "Khi tìm hiểu mã di truyền ở sinh vật, mỗi nhận định sau đây là Đúng hay Sai?",
          items: [
            {
              text: "Mã di truyền được đọc theo từng bộ ba một.",
              correct: true,
              explain: "Đúng. Mã di truyền đọc theo từng bộ ba.",
            },
            {
              text: "Các bộ ba được đọc có thể gối chồng nhau.",
              correct: false,
              explain: "Sai. Các bộ ba được đọc liên tục, không gối chồng.",
            },
            {
              text: "Mã di truyền được đọc trên mRNA theo chiều từ 3’ → 5’.",
              correct: false,
              explain: "Sai. Ribosome đọc mRNA theo chiều 5’ → 3’.",
            },
            {
              text: "Mã di truyền là trình tự các nucleotide (3 nucleotide liền kề) trong gene, quy định trình tự các amino acid trong chuỗi polypeptide.",
              correct: false,
              explain:
                "Sai. Mã di truyền được xét trên các bộ ba của mRNA, không phải trực tiếp là trình tự bộ ba trên gene như phát biểu này.",
            },
          ],
        },
        {
          id: "2-III-1",
          n: 1,
          part: "III",
          type: "short",
          images: [
            {
              src: "assests/figures/b2-dich-ma.jpeg",
              alt: "Sơ đồ dịch mã với các tRNA đánh số 1, 2, 3 và codon trên mRNA",
            },
          ],
          prompt:
            "Hình bên mô tả quá trình tổng hợp chuỗi polypeptide từ một phân tử mRNA trong tế bào nhân thực. tRNA mang amino acid số mấy tương ứng với codon CAC trên mRNA?",
          sample: "2",
          grade: acceptsNumber(2),
          reject: ["1", "3"],
          explain:
            "Codon CAC bắt cặp với anticodon GUG. Trên hình, tRNA số 2 mang anticodon GUG. Codon CAC mã hóa histidine.",
        },
        {
          id: "2-III-2",
          n: 2,
          part: "III",
          type: "short",
          prompt:
            "Có bao nhiêu loại nucleotide dưới đây là nguyên liệu cho quá trình phiên mã?\n1. Thymine.\n2. Adenine.\n3. Uracil.\n4. Cytosine.",
          sample: "3",
          grade: acceptsNumber(3),
          reject: ["4", "2", "1"],
          explain:
            "Có 3 loại: adenine, uracil và cytosine. Thymine không phải nguyên liệu thông thường của phiên mã.",
        },
      ],
    },
    {
      id: "b3",
      index: 3,
      title: "Điều hòa biểu hiện gene",
      questions: [
        {
          id: "3-I-1",
          n: 1,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Cấu trúc của operon lac bao gồm những thành phần nào?",
          options: [
            "Gene điều hòa (lacI), vùng P, vùng O.",
            "Gene điều hòa (lacI), gene cấu trúc (lacZ, lacY, lacA), vùng O.",
            "Vùng P, gene cấu trúc (lacZ, lacY, lacA), vùng O.",
            "Gene điều hòa (lacI), gene cấu trúc (lacZ, lacY, lacA), vùng P.",
          ],
          correct: 2,
          explain:
            "Operon lac gồm vùng khởi động P, vùng vận hành O và các gene cấu trúc lacZ, lacY, lacA. Gene lacI nằm ngoài operon.",
        },
        {
          id: "3-I-2",
          n: 2,
          part: "I",
          type: "mcq",
          letter: "D",
          prompt:
            "Đối với biểu hiện gene của operon lac ở vi khuẩn E. coli, allolactose có vai trò",
          options: [
            "hoạt hóa RNA polymerase.",
            "ức chế gene điều hòa (lacI).",
            "hoạt hóa vùng P.",
            "vô hiệu hóa protein ức chế.",
          ],
          correct: 3,
          explain:
            "Allolactose làm bất hoạt protein ức chế, giúp operon được phiên mã.",
        },
        {
          id: "3-I-3",
          n: 3,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Trong cơ chế điều hòa biểu hiện gene của operon lac ở E. coli, protein ức chế do gene điều hòa (lacI) tổng hợp có chức năng gắn vào vùng",
          options: [
            "O để khởi động quá trình phiên mã của các gene cấu trúc.",
            "O để ức chế quá trình phiên mã của các gene cấu trúc.",
            "P để ức chế quá trình phiên mã của các gene cấu trúc.",
            "P để khởi động quá trình phiên mã của các gene cấu trúc.",
          ],
          correct: 1,
          explain:
            "Protein ức chế gắn vùng vận hành O và ngăn phiên mã các gene cấu trúc.",
        },
        {
          id: "3-I-4",
          n: 4,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Chức năng của gene điều hòa (lacI) là",
          options: [
            "kích thích hoạt động điều khiển tổng hợp protein của gene cấu trúc.",
            "tạo tín hiệu để báo hiệu kết thúc quá trình điều khiển tổng hợp protein của gene cấu trúc.",
            "kiểm soát biểu hiện của gene cấu trúc thông qua các sản phẩm do chính gene điều hòa tạo ra.",
            "luôn luôn ức chế quá trình điều khiển tổng hợp protein của các gene cấu trúc.",
          ],
          correct: 2,
          explain:
            "Gene điều hòa kiểm soát gene cấu trúc thông qua sản phẩm của nó, ở đây là protein ức chế.",
        },
        {
          id: "3-I-5",
          n: 5,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Operon là một",
          options: [
            "nhóm gene ở trên một đoạn DNA có liên quan về chức năng, có chung một cơ chế điều hòa.",
            "đoạn phân tử DNA có một chức năng nhất định trong quá trình điều hòa.",
            "đoạn phân tử acid nucleic có chức năng điều hòa biểu hiện của gene cấu trúc.",
            "tập hợp gồm các gene cấu trúc và gene điều hòa nằm cạnh nhau.",
          ],
          correct: 0,
          explain:
            "Operon là nhóm gene liên quan về chức năng và cùng chịu một cơ chế điều hòa.",
        },
        {
          id: "3-I-6",
          n: 6,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Trong cơ chế điều hòa biểu hiện gene của operon lac ở vi khuẩn E. coli, lacI có vai trò",
          options: [
            "trực tiếp kiểm soát biểu hiện của gene cấu trúc.",
            "tổng hợp protein ức chế.",
            "tổng hợp protein cấu tạo nên enzyme phân giải lactose.",
            "hoạt hóa enzyme phân giải lactose.",
          ],
          correct: 1,
          explain: "Gene lacI mã hóa protein ức chế.",
        },
        {
          id: "3-I-7",
          n: 7,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Cơ chế điều hòa biểu hiện gene của operon lac khi có lactose là",
          options: [
            "bất hoạt protein ức chế, hoạt hóa operon phiên mã tổng hợp enzyme phân giải lactose.",
            "cùng protein ức chế bất hoạt vùng O, gây ức chế phiên mã.",
            "làm cho enzyme chuyển hóa nó có hoạt tính tăng lên nhiều lần.",
            "là chất gây cảm ứng ức chế biểu hiện của operon, ức chế phiên mã.",
          ],
          correct: 0,
          explain:
            "Khi có lactose, protein ức chế bị bất hoạt và operon có thể được phiên mã.",
        },
        {
          id: "3-I-8",
          n: 8,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt:
            "Cấu trúc operon ở sinh vật nhân sơ gồm các thành phần theo trật tự là",
          options: [
            "vùng P – vùng O – nhóm gene cấu trúc (lacZ, lacY, lacA).",
            "gene điều hòa (lacI) – vùng P – vùng O – nhóm gene cấu trúc (lacZ, lacY, lacA).",
            "gene điều hòa (lacI) – vùng O – nhóm gene cấu trúc (lacZ, lacY, lacA).",
            "gene điều hòa (lacI) – vùng P – nhóm gene cấu trúc (lacZ, lacY, lacA).",
          ],
          correct: 0,
          explain:
            "Trong operon, trật tự là vùng khởi động P, rồi vùng vận hành O, rồi nhóm gene cấu trúc.",
        },
        {
          id: "3-I-9",
          n: 9,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Trong cơ chế điều hòa biểu hiện gene ở sinh vật nhân sơ, vai trò của lacI là",
          options: [
            "nơi tiếp xúc với enzyme RNA polymerase.",
            "mang thông tin quy định protein điều hòa.",
            "mang thông tin quy định enzyme RNA polymerase.",
            "nơi liên kết với protein ức chế.",
          ],
          correct: 1,
          explain: "lacI mang thông tin mã hóa protein điều hòa.",
        },
        {
          id: "3-I-10",
          n: 10,
          part: "I",
          type: "mcq",
          letter: "A",
          images: [
            {
              src: "assests/figures/b3-cau10-operon.jpeg",
              alt: "Sơ đồ operon lac đánh số 1 đến 4, cụm số 4 gồm ba gene",
            },
          ],
          prompt: "Cấu trúc số 4 trong operon lac ở E. coli không hoạt động khi",
          options: [
            "trong tế bào không có lactose.",
            "môi trường có hoặc không có lactose.",
            "môi trường có nhiều lactose.",
            "trong tế bào có lactose.",
          ],
          correct: 0,
          explain:
            "Cụm số 4 là nhóm gene cấu trúc. Các gene này không được phiên mã khi tế bào không có lactose, vì protein ức chế vẫn gắn và chặn phiên mã. Khi có lactose, cụm này có thể hoạt động.",
        },
        {
          id: "3-II-1",
          n: 1,
          part: "II",
          type: "tf",
          images: [
            {
              src: "assests/figures/b3-dung-sai-operon.jpeg",
              alt: "Sơ đồ operon lac màu, đánh số 1 đến 5",
            },
          ],
          lead: "Cho hình vẽ cấu trúc operon lac. Mỗi nhận định sau đây là Đúng hay Sai?",
          items: [
            {
              text: "Protein điều hòa có thể liên kết vào để ngăn cản quá trình phiên mã khi gắn vào vị trí số 3.",
              correct: true,
              explain:
                "Đúng. Trên hình, protein điều hòa hướng tới vị trí 3, là vùng vận hành. Gắn vào đó có thể ngăn phiên mã.",
            },
            {
              text: "Vị trí số 2 là vùng khởi động (P), vị trí số 3 là vùng vận hành (O).",
              correct: true,
              explain: "Đúng. Sơ đồ này đánh số 2 là P và 3 là O.",
            },
            {
              text: "Enzyme RNA polymerase bám vào vùng ở vị trí số 2 và các gene cấu trúc được biểu hiện.",
              correct: true,
              explain:
                "Đúng. RNA polymerase bám vùng khởi động, vị trí 2, để khởi đầu phiên mã các gene cấu trúc.",
            },
            {
              text: "Vị trí số 1 chứa một gene quy định protein điều hòa hoạt động của operon lac.",
              correct: true,
              explain:
                "Đúng. Vị trí 1 là gene điều hòa, phiên mã thành mRNA rồi tạo protein điều hòa (vị trí 5).",
            },
          ],
        },
        {
          id: "3-II-2",
          n: 2,
          part: "II",
          type: "tf",
          lead: "Mỗi nhận định sau đây là Đúng hay Sai về điều hòa hoạt động gene theo mô hình operon lac?",
          items: [
            {
              text: "Ở operon lac, gene điều hòa giữ vai trò quan trọng trong tổng hợp ra chất ức chế.",
              correct: true,
              explain: "Đúng. Gene điều hòa lacI mã hóa protein ức chế.",
            },
            {
              text: "Trong cơ chế điều hòa hoạt động của operon lac, gene điều hòa luôn tổng hợp protein ức chế khi môi trường có lactose và khi môi trường không có lactose.",
              correct: true,
              explain:
                "Đúng. lacI vẫn tổng hợp protein ức chế dù môi trường có hay không có lactose. Lactose ảnh hưởng khả năng gắn của protein đó vào vùng O.",
            },
            {
              text: "Trong mô hình cấu trúc của operon lac, vùng O là nơi enzyme RNA polymerase bám vào và khởi đầu phiên mã.",
              correct: false,
              explain: "Sai. RNA polymerase bám vùng P, không phải vùng O.",
            },
            {
              text: "Ở mô hình operon lac của E. coli, vùng O là nơi protein ức chế bám vào; nếu vùng này đột biến thì luôn làm cho protein ức chế không bám và không ức chế được.",
              correct: false,
              explain:
                "Sai. Đột biến vùng O không phải lúc nào cũng làm protein ức chế mất khả năng bám. Còn tùy loại đột biến.",
            },
          ],
        },
        {
          id: "3-III-1",
          n: 1,
          part: "III",
          type: "short",
          prompt: "Cấu trúc của operon gồm bao nhiêu thành phần?",
          sample: "3",
          grade: acceptsNumber(3),
          reject: ["4", "2", "5"],
          explain:
            "Operon có 3 thành phần chính: vùng khởi động P, vùng vận hành O và nhóm gene cấu trúc.",
        },
        {
          id: "3-III-2",
          n: 2,
          part: "III",
          type: "short",
          images: [
            {
              src: "assests/figures/b3-tra-loi-ngan-operon.jpeg",
              alt: "Sơ đồ operon lac, protein ức chế nằm trên vị trí số 2",
            },
          ],
          prompt:
            "Trong cơ chế điều hòa biểu hiện gene của operon lac ở E. coli, khi môi trường không có lactose thì protein điều hòa sẽ ức chế quá trình phiên mã bằng cách gắn vào vùng số mấy?",
          sample: "2",
          grade: acceptsNumber(2),
          reject: ["1", "4", "5"],
          explain:
            "Trên hình của câu này, khối protein ức chế nằm ở vị trí số 2 và dấu × chặn mũi tên phiên mã. Khi không có lactose, protein điều hòa gắn vào vùng số 2. Sơ đồ màu ở phần Đúng/Sai đánh số vùng vận hành là 3; câu này chấm theo hình ngay tại câu hỏi.",
        },
      ],
    },
    {
      id: "b4",
      index: 4,
      title: "Đột biến gene",
      questions: [
        {
          id: "4-I-1",
          n: 1,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Đột biến gene là",
          options: [
            "sự biến đổi một cặp nucleotide trong gene, xảy ra tại một điểm nào đó của phân tử DNA.",
            "sự biến đổi của một số cặp nucleotide trong gene.",
            "những biến đổi xảy ra trong cấu trúc của gene, có thể liên quan đến một cặp nucleotide hoặc một số cặp nucleotide.",
            "những biến đổi xảy ra trên suốt chiều dài của phân tử DNA.",
          ],
          correct: 2,
          explain:
            "Đột biến gene là biến đổi cấu trúc gene, liên quan một hoặc một số cặp nucleotide.",
        },
        {
          id: "4-I-2",
          n: 2,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Thể đột biến là những cá thể mang gene đột biến",
          options: [
            "đã biểu hiện thành kiểu hình.",
            "chưa biểu hiện thành kiểu hình.",
            "chưa hoặc đã biểu hiện thành kiểu hình.",
            "lặn hoặc trội chưa biểu hiện thành kiểu hình.",
          ],
          correct: 0,
          explain:
            "Thể đột biến là cá thể mang đột biến đã biểu hiện ra kiểu hình.",
        },
        {
          id: "4-I-3",
          n: 3,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Đột biến gene (đột biến điểm) có các dạng",
          options: [
            "mất, thêm, thay thế một cặp nucleotide.",
            "mất, thêm, đảo vị trí một cặp nucleotide.",
            "mất, thay thế, đảo vị trí một cặp nucleotide.",
            "thêm, thay thế, đảo vị trí một cặp nucleotide.",
          ],
          correct: 0,
          explain:
            "Ba dạng đột biến điểm thường xét: mất, thêm hoặc thay thế một cặp nucleotide.",
        },
        {
          id: "4-I-4",
          n: 4,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Loại đột biến gene nào xảy ra không làm thay đổi số liên kết hydrogen?",
          options: [
            "Thay thế cặp A–T bằng cặp G–C.",
            "Thay thế cặp G–C bằng cặp A–T.",
            "Thay thế cặp A–T bằng cặp T–A.",
            "Thêm hoặc mất một cặp G–C.",
          ],
          correct: 2,
          explain:
            "Cặp A–T và cặp T–A đều có 2 liên kết hydrogen. Thay A–T bằng T–A không đổi số liên kết hydrogen.",
        },
        {
          id: "4-I-5",
          n: 5,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Một gene dài 5100 Å, có 3600 liên kết hydrogen. Gene này bị đột biến thêm 1 cặp nucleotide và hơn gene bình thường 3 liên kết hydrogen. Số lượng từng loại nucleotide của gene đột biến là:",
          options: [
            "A = T = 901; G = C = 601.",
            "A = T = 901; G = C = 600.",
            "A = T = 900; G = C = 601.",
            "A = T = 899; G = C = 601.",
          ],
          correct: 2,
          explain:
            "Số cặp nucleotide = 5100 / 3,4 = 1500. Gọi số cặp A–T là x, số cặp G–C là y: x + y = 1500 và 2x + 3y = 3600, suy ra y = 600, x = 900. Thêm một cặp làm tăng 3 liên kết hydrogen thì cặp thêm vào là G–C. Gene đột biến có A = T = 900 và G = C = 601.",
        },
        {
          id: "4-I-6",
          n: 6,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Điều nào dưới đây không đúng khi nói về đột biến gene?",
          options: [
            "Đột biến gene luôn gây hại cho sinh vật vì làm biến đổi cấu trúc của gene.",
            "Đột biến gene là nguồn nguyên liệu cho quá trình chọn, tạo giống và tiến hóa của sinh vật.",
            "Đột biến gene có thể làm cho sinh vật ngày càng đa dạng, phong phú.",
            "Đột biến gene có thể có hại, có lợi hoặc trung tính.",
          ],
          correct: 0,
          explain:
            "Đột biến gene không phải lúc nào cũng có hại. Nó có thể có lợi, có hại hoặc trung tính. Phát biểu A không đúng.",
        },
        {
          id: "4-I-7",
          n: 7,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt: "Tác nhân gây đột biến 5-BU thuộc nhóm nguyên nhân",
          options: [
            "tự rối loạn.",
            "tác nhân vật lí.",
            "tác nhân hóa học.",
            "tác nhân sinh học.",
          ],
          correct: 2,
          explain: "5-BU là chất tương tự base, thuộc tác nhân hóa học.",
        },
        {
          id: "4-I-8",
          n: 8,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt: "Tác nhân gây đột biến tia UV thuộc nhóm nguyên nhân",
          options: [
            "tự rối loạn.",
            "tác nhân vật lí.",
            "tác nhân hóa học.",
            "tác nhân sinh học.",
          ],
          correct: 1,
          explain: "Tia UV là tác nhân vật lí.",
        },
        {
          id: "4-I-9",
          n: 9,
          part: "I",
          type: "mcq",
          letter: "D",
          prompt:
            "Loại đột biến khi xảy ra có thể không làm thay đổi số lượng amino acid và trình tự các amino acid trong chuỗi polypeptide thuộc dạng đột biến",
          options: [
            "không có dạng đột biến nào.",
            "thêm một cặp nucleotide ở ngay sau bộ ba mở đầu.",
            "mất một cặp nucleotide ở gần bộ ba kết thúc.",
            "thay thế nucleotide trong các bộ ba mã hóa amino acid.",
          ],
          correct: 3,
          explain:
            "Thay thế một nucleotide có thể tạo codon đồng nghĩa, nên amino acid và độ dài chuỗi không đổi.",
        },
        {
          id: "4-I-10",
          n: 10,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Gene bình thường có các nucleotide như sau: 600A và 900G. Gene đột biến sinh ra do thay thế nucleotide. Gene đột biến nhân đôi một lần, môi trường đã cung cấp 601A và 899G. Đây là đột biến",
          options: [
            "thay thế 1 cặp A–T bằng 1 cặp T–A.",
            "thay thế 1 cặp A–T bằng G–C.",
            "thay thế 1 cặp G–C bằng 1 cặp A–T.",
            "thay thế 1 cặp C–G bằng 1 cặp G–C.",
          ],
          correct: 2,
          explain:
            "Số A môi trường cung cấp tăng từ 600 lên 601, số G giảm từ 900 xuống 899. Đó là hệ quả của việc thay một cặp G–C bằng một cặp A–T.",
        },
        {
          id: "4-II-1",
          n: 1,
          part: "II",
          type: "tf",
          images: [
            {
              src: "assests/figures/b4-gene-h.png",
              alt: "Gene H bình thường, polypeptide fMet–Thr–His–Gln",
              caption: "Gene H",
            },
            {
              src: "assests/figures/b4-gene-h1.png",
              alt: "Gene H1 đột biến, xuất hiện codon kết thúc UAA và polypeptide ngắn hơn",
              caption: "Gene H1",
            },
          ],
          lead: "Hình mô tả gene bình thường (H) và gene đột biến (H1). Mỗi nhận định sau đây là Đúng hay Sai?",
          items: [
            {
              text: "Allele H1 là dạng đột biến thường gây ảnh hưởng lớn đến sự biểu hiện của gene so với ban đầu.",
              correct: true,
              explain:
                "Đúng. H1 làm codon CAA thành UAA, chuỗi polypeptide dừng sớm và ngắn hơn. Dạng này thường làm sản phẩm của gene thay đổi mạnh.",
            },
            {
              text: "Đây là dạng đột biến gene vô nghĩa.",
              correct: true,
              explain:
                "Đúng. Một codon mã hóa glutamine (CAA) bị thay thành codon kết thúc UAA. Đó là đột biến vô nghĩa.",
            },
            {
              text: "Đột biến này làm chuỗi polypeptide do gene đột biến tổng hợp bị thay đổi nhiều amino acid so với gene ban đầu.",
              correct: false,
              explain:
                "Sai. Các amino acid phía trước vị trí đột biến vẫn là fMet–Thr–His. Chuỗi bị cắt ngắn, không phải bị đổi hàng loạt amino acid như đột biến dịch khung.",
            },
            {
              text: "Đột biến tạo H1 có thể làm tăng quá trình sinh lý của cơ thể, đóng góp vào quá trình tiến hóa và chọn giống.",
              correct: true,
              explain:
                "Đúng ở mức nguyên tắc khái quát: đột biến có thể tạo biến dị có lợi trong một điều kiện nhất định. Chữ “có thể” không có nghĩa là mọi đột biến cụ thể đều có lợi.",
            },
          ],
        },
        {
          id: "4-II-2",
          n: 2,
          part: "II",
          type: "tf",
          lead: "Mỗi nhận định dưới đây về đột biến gene là Đúng hay Sai?",
          items: [
            {
              text: "Đột biến thay thế một cặp nucleotide luôn dẫn đến kết thúc sớm quá trình dịch mã.",
              correct: false,
              explain:
                "Sai. Thay thế một cặp nucleotide không phải lúc nào cũng tạo codon kết thúc sớm.",
            },
            {
              text: "Đột biến gene tạo ra các allele mới làm phong phú vốn gene của quần thể.",
              correct: true,
              explain: "Đúng. Đột biến gene có thể tạo allele mới.",
            },
            {
              text: "Đột biến gene có thể có lợi, có hại hoặc trung tính đối với thể đột biến.",
              correct: true,
              explain: "Đúng. Đột biến có thể có lợi, có hại hoặc trung tính.",
            },
            {
              text: "Mức độ gây hại của allele đột biến phụ thuộc vào tổ hợp gene và điều kiện môi trường.",
              correct: true,
              explain:
                "Đúng. Tác động của allele đột biến phụ thuộc tổ hợp gene và môi trường.",
            },
          ],
        },
        {
          id: "4-III-1",
          n: 1,
          part: "III",
          type: "short",
          prompt:
            "Một gene dài 0,51 μm, trên mạch gốc của gene có A = 300, T = 400. Nếu gene xảy ra đột biến điểm thay thế cặp A–T bằng cặp G–C thì số liên kết hydrogen của gene đột biến là bao nhiêu?",
          sample: "3801",
          also: ["3.801", "3,801"],
          grade: acceptsNumber(3801),
          reject: ["3800", "3600"],
          explain:
            "0,51 μm = 510 nm. Số cặp nucleotide = 510 / 0,34 = 1500. Trên mạch gốc A = 300 và T = 400 nên có 700 cặp A–T; số cặp G–C = 800. Liên kết hydrogen ban đầu = 700×2 + 800×3 = 3800. Thay một cặp A–T bằng G–C làm tăng 1 liên kết, thành 3801.",
        },
        {
          id: "4-III-2",
          n: 2,
          part: "III",
          type: "short",
          prompt:
            "Cơ chế phát sinh đột biến gene do tác nhân 5-BU trải qua bao nhiêu lần nhân đôi để từ cặp nucleotide A–T thay thế thành G–C?",
          sample: "2",
          grade: acceptsNumber(2),
          reject: ["1", "3"],
          explain:
            "5-BU có thể bắt cặp với A, rồi ở lần nhân đôi tiếp theo dẫn tới thay cặp A–T bằng G–C. Cần 2 lần nhân đôi.",
        },
      ],
    },
    {
      id: "b5",
      index: 5,
      title: "Công nghệ gene",
      questions: [
        {
          id: "5-I-1",
          n: 1,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Công nghệ gene là gì?",
          options: [
            "Quy trình kĩ thuật thao tác trên phân tử DNA làm thay đổi kiểu gene và kiểu hình của sinh vật, tạo ra các sản phẩm của gene sử dụng trong thực tiễn.",
            "Quy trình tạo ra các giống cây trồng mới chỉ bằng phương pháp lai hữu tính.",
            "Quy trình kĩ thuật tạo ra phân tử DNA từ hai nguồn khác nhau rồi chuyển vào tế bào nhận.",
            "Quy trình làm thay đổi số lượng nhiễm sắc thể của sinh vật.",
          ],
          correct: 0,
          explain:
            "Công nghệ gene thao tác trên DNA để thay đổi kiểu gene, kiểu hình và tạo sản phẩm phục vụ thực tiễn.",
        },
        {
          id: "5-I-2",
          n: 2,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt: "Công nghệ gene gồm những công nghệ nào sau đây?",
          options: [
            "Công nghệ tế bào và công nghệ enzyme.",
            "Công nghệ DNA tái tổ hợp và công nghệ tạo sinh vật biến đổi gene.",
            "Công nghệ nuôi cấy mô và công nghệ tạo giống đột biến.",
            "Công nghệ vi sinh và công nghệ tế bào thực vật.",
          ],
          correct: 1,
          explain:
            "Gồm công nghệ DNA tái tổ hợp và công nghệ tạo sinh vật biến đổi gene.",
        },
        {
          id: "5-I-3",
          n: 3,
          part: "I",
          type: "mcq",
          letter: "A",
          prompt: "Công nghệ DNA tái tổ hợp là quy trình kĩ thuật",
          options: [
            "tạo ra phân tử DNA từ hai nguồn khác nhau rồi chuyển vào tế bào nhận.",
            "làm tăng số lượng nhiễm sắc thể trong tế bào nhận.",
            "tạo ra các tế bào có kích thước lớn hơn tế bào ban đầu.",
            "thao tác trên phân tử DNA làm thay đổi kiểu gene và kiểu hình của sinh vật, tạo ra các sản phẩm của gene sử dụng trong thực tiễn.",
          ],
          correct: 0,
          explain:
            "DNA tái tổ hợp được tạo từ DNA của hai nguồn khác nhau rồi chuyển vào tế bào nhận.",
        },
        {
          id: "5-I-4",
          n: 4,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt: "DNA tái tổ hợp gồm",
          options: [
            "một gene và một phân tử RNA.",
            "một gene và DNA dùng làm vector.",
            "một protein và một phân tử DNA.",
            "một gene và một phân tử enzyme.",
          ],
          correct: 1,
          explain: "DNA tái tổ hợp gồm gene cần chuyển và DNA vector.",
        },
        {
          id: "5-I-5",
          n: 5,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Đoạn DNA được sử dụng làm vector trong công nghệ DNA tái tổ hợp phải có khả năng",
          options: [
            "tự phân giải trong tế bào nhận.",
            "tái bản cũng như đảm bảo cho gene chuyển được phiên mã, dịch mã tạo sản phẩm protein của gene chuyển trong tế bào nhận.",
            "đảm bảo cho gene chuyển được phiên mã, dịch mã tạo sản phẩm protein của gene chuyển trong tế bào nhận.",
            "ngăn cản gene chuyển hoạt động trong tế bào nhận.",
          ],
          correct: 1,
          explain:
            "Vector cần tái bản được và hỗ trợ gene chuyển biểu hiện trong tế bào nhận.",
        },
        {
          id: "5-I-6",
          n: 6,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Restrictase và ligase tham gia vào công đoạn nào sau đây trong kĩ thuật chuyển gene?",
          options: [
            "Tách DNA nhiễm sắc thể của tế bào cho và tách DNA plasmid ra khỏi tế bào.",
            "Cắt, nối DNA của tế bào cho và DNA plasmid ở những điểm xác định tạo DNA tái tổ hợp.",
            "Chuyển DNA tái tổ hợp vào tế bào nhận.",
            "Tạo điều kiện cho gene đã ghép được biểu hiện.",
          ],
          correct: 1,
          explain:
            "Restrictase cắt DNA tại vị trí xác định; ligase nối các đoạn để tạo DNA tái tổ hợp.",
        },
        {
          id: "5-I-7",
          n: 7,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Trong kĩ thuật tạo DNA tái tổ hợp, enzyme DNA ligase có chức năng nào sau đây?",
          options: [
            "Cắt DNA tại các vị trí đặc hiệu.",
            "Nối các đoạn DNA với nhau tạo thành phân tử DNA tái tổ hợp.",
            "Nhân đôi DNA tái tổ hợp.",
            "Đưa DNA tái tổ hợp vào tế bào nhận.",
          ],
          correct: 1,
          explain: "DNA ligase nối các đoạn DNA để tạo phân tử DNA tái tổ hợp.",
        },
        {
          id: "5-I-8",
          n: 8,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt: "Thành tựu nào sau đây là kết quả của ứng dụng công nghệ gene?",
          options: [
            "Cừu Dolly được tạo ra bằng phương pháp nhân bản vô tính.",
            "Vi khuẩn được sử dụng để sản xuất insulin của người.",
            "Tạo giống cây trồng bằng phương pháp lai hữu tính truyền thống.",
            "Tạo giống vật nuôi bằng phương pháp chọn lọc nhân tạo.",
          ],
          correct: 1,
          explain:
            "Vi khuẩn sản xuất insulin người là thành tựu công nghệ gene. Cừu Dolly được tạo bằng nhân bản vô tính.",
        },
        {
          id: "5-I-9",
          n: 9,
          part: "I",
          type: "mcq",
          letter: "B",
          prompt:
            "Trong kĩ thuật chuyển gene, sau khi tạo được DNA tái tổ hợp, bước tiếp theo thường là:",
          options: [
            "cắt DNA tái tổ hợp bằng enzyme restrictase.",
            "đưa DNA tái tổ hợp vào tế bào nhận.",
            "tách DNA tái tổ hợp khỏi tế bào cho.",
            "làm biến đổi gene đánh dấu trên thể truyền.",
          ],
          correct: 1,
          explain: "Sau khi tạo DNA tái tổ hợp, thường đưa nó vào tế bào nhận.",
        },
        {
          id: "5-I-10",
          n: 10,
          part: "I",
          type: "mcq",
          letter: "C",
          prompt:
            "Một số loại vi khuẩn biến đổi gene giúp cây trồng tăng cường hấp thụ nitrogen, ức chế các vi khuẩn và nấm gây bệnh cho cây. Đây là thành tựu trong lĩnh vực nào của công nghệ DNA tái tổ hợp?",
          options: [
            "Trong ngành dược phẩm.",
            "Trong ngành công nghiệp.",
            "Trong nông nghiệp.",
            "Trong bảo vệ môi trường.",
          ],
          correct: 2,
          explain:
            "Vi khuẩn biến đổi gene hỗ trợ cây trồng là ứng dụng trong nông nghiệp.",
        },
        {
          id: "5-II-1",
          n: 1,
          part: "II",
          type: "tf",
          lead: "Khi nói về công nghệ DNA tái tổ hợp, các nhận định sau đây là Đúng hay Sai?",
          items: [
            {
              text: "Công nghệ DNA tái tổ hợp là quy trình kĩ thuật tạo ra phân tử DNA từ hai nguồn khác nhau rồi chuyển vào tế bào nhận.",
              correct: true,
              explain:
                "Đúng. Đây là quy trình tạo DNA từ hai nguồn rồi chuyển vào tế bào nhận.",
            },
            {
              text: "Đoạn DNA được sử dụng làm vector trong công nghệ DNA tái tổ hợp phải có khả năng tự phân giải trong tế bào nhận.",
              correct: false,
              explain:
                "Sai. Vector cần có khả năng tái bản, không phải tự phân giải trong tế bào nhận.",
            },
            {
              text: "DNA tái tổ hợp gồm một protein và một phân tử DNA.",
              correct: false,
              explain:
                "Sai. DNA tái tổ hợp là phân tử DNA được ghép từ các đoạn DNA, không phải phức hợp protein và DNA.",
            },
            {
              text: "Trong kĩ thuật tạo DNA tái tổ hợp, enzyme DNA ligase có chức năng nối các đoạn DNA với nhau tạo thành phân tử DNA tái tổ hợp.",
              correct: true,
              explain: "Đúng. DNA ligase nối các đoạn DNA.",
            },
          ],
        },
        {
          id: "5-II-2",
          n: 2,
          part: "II",
          type: "tf",
          lead: "Khi nói về sinh vật biến đổi gene, các nhận định sau đây là Đúng hay Sai?",
          items: [
            {
              text: "Sinh vật biến đổi gene là sinh vật có hệ gene đã được biến đổi, chủ yếu là có thêm gene mới từ loài khác.",
              correct: true,
              explain:
                "Đúng. Sinh vật biến đổi gene có hệ gene được thay đổi, thường được đưa thêm gene mới.",
            },
            {
              text: "Để tạo ra động vật chuyển gene, các nhà khoa học phải sử dụng trứng đã thụ tinh lâu ngày làm tế bào nhận gene chuyển.",
              correct: false,
              explain:
                "Sai. Không dùng trứng đã thụ tinh từ lâu ngày. Tế bào nhận và thời điểm đưa gene phụ thuộc quy trình tạo động vật chuyển gene.",
            },
            {
              text: "Tạo thực vật và động vật biến đổi gene đều dựa trên nguyên lí DNA tái tổ hợp.",
              correct: true,
              explain:
                "Đúng. Việc tạo sinh vật biến đổi gene dựa trên nguyên lí DNA tái tổ hợp.",
            },
            {
              text: "Mục đích của tạo thực vật và động vật biến đổi gene là tạo ra những sinh vật có đặc điểm giống với những sinh vật đã từng tồn tại trước đó.",
              correct: false,
              explain:
                "Sai. Mục đích là tạo đặc điểm mong muốn, không phải làm sinh vật giống các sinh vật từng tồn tại trước đó.",
            },
          ],
        },
        {
          id: "5-III-1",
          n: 1,
          part: "III",
          type: "short",
          prompt:
            "Xét các thành tựu sau, có bao nhiêu thành tựu được tạo ra nhờ công nghệ gene?\n(1) Vi khuẩn sản xuất insulin người.\n(2) Cừu Dolly được tạo ra bằng nhân bản vô tính.\n(3) Lúa chuyển gene có thêm gene tổng hợp nên tiền chất của vitamin A.\n(4) Cừu chuyển gene có gene quy định protein antithrombin của người.",
          sample: "3",
          grade: acceptsNumber(3),
          reject: ["4", "2", "1"],
          explain:
            "Có 3 thành tựu: (1), (3) và (4). Cừu Dolly được tạo bằng nhân bản vô tính, không xếp vào công nghệ gene theo cách phân loại của câu này.",
        },
        {
          id: "5-III-2",
          n: 2,
          part: "III",
          type: "short",
          prompt:
            "Công ty Eli Lilly đã sản xuất và bán ra thị trường thuốc insulin người được tạo ra nhờ công nghệ DNA tái tổ hợp vào năm nào?",
          sample: "1982",
          grade: acceptsNumber(1982),
          reject: ["1978", "1990", "2000"],
          explain:
            "Năm 1982, insulin người sản xuất bằng công nghệ DNA tái tổ hợp được đưa ra thị trường.",
        },
      ],
    },
  ];

  function selfCheck() {
    const letters = "ABCD";
    const ids = new Set();
    for (const lesson of lessons) {
      for (const q of lesson.questions) {
        if (ids.has(q.id)) throw new Error("Trùng mã " + q.id);
        ids.add(q.id);
        if (q.type === "mcq") {
          if (q.options.length !== 4) throw new Error(q.id + " thiếu phương án");
          if (letters[q.correct] !== q.letter) throw new Error(q.id + " sai chữ cái");
        } else if (q.type === "tf") {
          if (!q.items || q.items.length !== 4) throw new Error(q.id + " thiếu ý");
        } else if (q.type === "short") {
          if (!q.grade(q.sample)) throw new Error(q.id + " không nhận đáp án mẫu");
          for (const sample of q.also || []) {
            if (!q.grade(sample)) throw new Error(q.id + " bác " + sample);
          }
          for (const sample of q.reject || []) {
            if (q.grade(sample)) throw new Error(q.id + " lại nhận " + sample);
          }
        } else {
          throw new Error("Loại câu lạ " + q.id);
        }
        for (const image of q.images || []) {
          if (!image.src.startsWith("assests/figures/")) {
            throw new Error(q.id + " sai đường dẫn hình");
          }
        }
      }
    }
    return ids.size;
  }

  globalThis.SINH12 = { lessons: lessons, selfCheck: selfCheck };
})();
