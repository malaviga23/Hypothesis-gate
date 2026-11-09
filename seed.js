const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding demo data for Hypothesis Gate...');

    // Hash default password
    const studentPass = await bcrypt.hash('student123', 10);
    const mentorPass = await bcrypt.hash('mentor123', 10);

    // 1. Insert Users
    // Check if demo student exists
    const [existingStudents] = await conn.query('SELECT id FROM users WHERE email = ?', ['student@hypothesisgate.edu']);
    let studentId;
    if (existingStudents.length === 0) {
      const [res] = await conn.query(
        `INSERT INTO users (name, email, password, role, institution, department, bio)
         VALUES (?, ?, ?, 'student', ?, ?, ?)`,
        [
          'Aarav Sharma',
          'student@hypothesisgate.edu',
          studentPass,
          'National Institute of Technology',
          'Computer Science & Engineering',
          'Final year B.Tech student specializing in Deep Learning and Healthcare Informatics.'
        ]
      );
      studentId = res.insertId;
    } else {
      studentId = existingStudents[0].id;
    }

    // Insert Mentors
    const mentorsData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'mentor@hypothesisgate.edu',
        institution: 'Indian Institute of Science / Stanford Affiliate',
        department: 'Artificial Intelligence & Biomedical Informatics',
        bio: 'Senior Researcher with 12+ years experience in privacy-preserving machine learning and medical diagnostic AI.',
        expertise: 'Federated Learning, Healthcare AI, Privacy-Preserving Systems',
        skills: 'PyTorch, Federated Learning, Medical Imaging, Differential Privacy, Python, Distributed Systems',
        experience_years: 12,
        availability_status: 'available',
        max_capacity: 4
      },
      {
        name: 'Prof. Aravind Swaminathan',
        email: 'aravind@hypothesisgate.edu',
        institution: 'National Institute of Technology',
        department: 'Distributed Systems & Cloud Computing',
        bio: 'Professor specializing in edge computing, edge caching, and scalable systems for large AI workloads.',
        expertise: 'Distributed Systems, Edge Computing, Large Language Models Cache',
        skills: 'Go, Kubernetes, Redis, LLM Caching, Distributed Protocols, Python',
        experience_years: 15,
        availability_status: 'available',
        max_capacity: 5
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena@hypothesisgate.edu',
        institution: 'Center for Advanced Research',
        department: 'Computer Vision & Robotics',
        bio: 'Research Scientist focusing on multimodal perception, self-supervised representation learning, and edge vision models.',
        expertise: 'Computer Vision, Self-Supervised Learning, Deep Learning',
        skills: 'OpenCV, PyTorch, TensorRT, Vision Transformers, Python',
        experience_years: 9,
        availability_status: 'limited',
        max_capacity: 3
      }
    ];

    const mentorIds = [];
    for (const m of mentorsData) {
      const [check] = await conn.query('SELECT id FROM users WHERE email = ?', [m.email]);
      if (check.length === 0) {
        const [res] = await conn.query(
          `INSERT INTO users (name, email, password, role, institution, department, bio, expertise, skills, experience_years, availability_status, max_capacity)
           VALUES (?, ?, ?, 'mentor', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.name, m.email, mentorPass, m.institution, m.department, m.bio, m.expertise, m.skills, m.experience_years, m.availability_status, m.max_capacity]
        );
        mentorIds.push(res.insertId);
      } else {
        mentorIds.push(check[0].id);
      }
    }

    const primaryMentorId = mentorIds[0];

    // 2. Insert Projects
    const [existingProjects] = await conn.query('SELECT id FROM projects WHERE student_id = ?', [studentId]);
    if (existingProjects.length === 0) {
      // Project 1: Complete pipeline project (at Hypothesis Lab)
      const [proj1Res] = await conn.query(
        `INSERT INTO projects 
         (student_id, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, expected_outcome, initial_hypothesis, status, current_stage, assigned_mentor_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'under_review', 'hypothesis_testing', ?)`,
        [
          studentId,
          'Federated Learning for Privacy-Preserving Chest X-Ray Anomaly Detection',
          'Healthcare AI & Federated Learning',
          'Hospitals cannot share raw patient chest X-ray scans due to strict HIPAA and GDPR regulations, resulting in medical AI models trained on small, localized datasets that fail to generalize across diverse clinical populations.',
          'Existing central aggregation models leak gradient inversions, require massive centralized bandwidth, and perform poorly under non-IID (non-independent and identically distributed) demographic label skew.',
          'We propose a personalized Federated Learning framework integrating Differential Privacy and dynamic layer-wise gradient aggregation to train multi-institutional diagnostic models without transferring raw radiological imagery.',
          '1. Implement a decentralized client-server federated loop with PySyft/PyTorch.\n2. Formulate dynamic gradient clipping with epsilon < 4.0 Differential Privacy.\n3. Validate generalization across NIH ChestX-ray14 and CheXpert datasets.\n4. Measure F1-score vs privacy budget trade-off.',
          'PyTorch, Flower/PySyft, TorchVision, Python, FastAPI, Docker, CUDA',
          'A robust model achieving >= 88% Area Under ROC Curve on out-of-distribution hospital test sets while preserving strict patient data anonymity.',
          'Decentralized federated aggregation with adaptive differential privacy can match centralized diagnostic AUC (within 3.5% margin) without transmitting patient images.',
          primaryMentorId
        ]
      );
      const projectId = proj1Res.insertId;

      // Project 2: Idea at Research / Mentor matching stage
      await conn.query(
        `INSERT INTO projects 
         (student_id, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, expected_outcome, initial_hypothesis, status, current_stage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'mentor_matching')`,
        [
          studentId,
          'Adaptive Semantic Cache for Multi-Turn Large Language Model Dialogue',
          'Natural Language Processing',
          'High latency and prohibitive API inference costs occur when users ask semantically similar or repetitive queries in multi-turn customer support and research dialogue systems.',
          'Standard LRU or exact key-value caches miss semantic paraphrases, while naive dense vector caching suffers from high cosine-similarity retrieval latency and false-positive context drift.',
          'An adaptive two-tier semantic cache using approximate nearest neighbor indexing (HNSW) paired with lightweight cross-encoder intent verification.',
          '1. Build semantic vector indexing layer using FAISS.\n2. Design cross-encoder thresholding for ambiguous queries.\n3. Benchmark cache hit latency against raw LLM inference.',
          'Python, FAISS, Sentence-Transformers, Redis, FastAPI',
          'Achieve > 40% reduction in average query latency and 35% API token cost savings with < 1.5% context drift.',
          'A dual-tier semantic cache can resolve >= 30% of repetitive enterprise conversational queries in under 50ms without degrading answer relevance.'
        ]
      );

      // 3. Insert Research Papers for Project 1
      const papers = [
        {
          title: 'Communication-Efficient Learning of Deep Networks from Decentralized Data',
          authors: 'H. Brendan McMahan, Eider Moore, Daniel Ramage, Seth Hampson, Blaise Agüera y Arcas',
          year: 2017,
          abstract: 'Modern mobile devices have access to a wealth of data suitable for learning. We advocate an alternative that leaves the training data distributed on the mobile devices, and learns a shared model by aggregating locally-computed updates.',
          source_url: 'https://arxiv.org/abs/1602.05629',
          doi: '10.48550/arXiv.1602.05629',
          relevance_score: 95,
          comparison_notes: 'Provides foundational FedAvg formulation used in our baseline client-server synchronization protocol.'
        },
        {
          title: 'Deep Learning with Differential Privacy',
          authors: 'Martin Abadi, Andy Chu, Ian Goodfellow, H. Brendan McMahan, Ilya Mironov, Kunal Talwar, Li Zhang',
          year: 2016,
          abstract: 'Machine learning techniques based on neural networks are achieving remarkable results. Often, the training data contains sensitive personal details. We develop algorithms for privacy-preserving deep learning with differential privacy guarantees.',
          source_url: 'https://arxiv.org/abs/1607.00133',
          doi: '10.1145/2976749.2978318',
          relevance_score: 91,
          comparison_notes: 'Directly informs our gradient clipping strategy and Moments Accountant implementation for privacy budget tracking.'
        },
        {
          title: 'CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning',
          authors: 'Pranav Rajpurkar, Jeremy Irvin, Kaylie Zhu, Brandon Yang, Hershel Mehta, Tony Duan, Daisy Ding, Aarti Bagul, Curtis Langlotz, Katie Shpanskaya, Matthew P. Lungren, Andrew Y. Ng',
          year: 2017,
          abstract: 'We develop an algorithm that can detect pneumonia from chest X-rays at a level exceeding practicing radiologists. The model, CheXNet, is a 121-layer Dense Convolutional Network trained on ChestX-ray14.',
          source_url: 'https://arxiv.org/abs/1711.05225',
          doi: '10.48550/arXiv.1711.05225',
          relevance_score: 89,
          comparison_notes: 'Serves as our backbone DenseNet-121 architecture for client-side local feature extraction.'
        }
      ];

      for (const p of papers) {
        const [pRes] = await conn.query(
          `INSERT INTO research_papers (project_id, title, authors, publication_year, abstract, source_url, doi, relevance_score, comparison_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [projectId, p.title, p.authors, p.year, p.abstract, p.source_url, p.doi, p.relevance_score, p.comparison_notes]
        );
        await conn.query(
          `INSERT INTO project_research_papers (project_id, paper_id, notes) VALUES (?, ?, ?)`,
          [projectId, pRes.insertId, 'Core reference for methodology and baseline evaluation.']
        );
      }

      // 4. Insert Validation Results for Project 1
      await conn.query(
        `INSERT INTO validation_results 
         (project_id, problem_clarity_score, problem_clarity_feedback, research_support_score, research_support_feedback, originality_score, originality_feedback, feasibility_score, feasibility_feedback, testability_score, testability_feedback, overall_score, overall_status, missing_info, recommended_improvements)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          86,
          'Strong problem formulation highlighting legal HIPAA/GDPR constraints and clinical dataset distribution skew.',
          90,
          'Extensive academic grounding including foundational McMahan (FedAvg), Abadi (DP-SGD), and Rajpurkar (CheXNet) papers.',
          80,
          'Novel combination of layer-wise dynamic gradient clipping and demographic fairness weighting in federated medical imaging.',
          84,
          'Accessible open-source datasets (NIH ChestX-ray14) and established frameworks (PySyft/Flower) ensure high reproducibility.',
          92,
          'Highly testable with concrete, measurable quantitative metrics: AUC, F1-score, epsilon privacy expenditure, and communication rounds.',
          86,
          'Validated — Ready for Mentorship',
          JSON.stringify(['Need specific GPU memory budget calculation for hospital client nodes']),
          JSON.stringify([
            'Include baseline comparisons with non-federated isolated local training.',
            'Document network bandwidth requirements under slow institutional WAN connections.'
          ])
        ]
      );

      // 5. Insert Mentor Request
      await conn.query(
        `INSERT INTO mentor_requests 
         (project_id, student_id, mentor_id, match_score, match_explanation, status, request_message, response_message)
         VALUES (?, ?, ?, 94, ?, 'accepted', ?, ?)`,
        [
          projectId,
          studentId,
          primaryMentorId,
          'High alignment in Healthcare AI and Differential Privacy (30% domain match, 25% technical skills, 20% research interests, 15% experience, 10% availability).',
          'Dear Dr. Jenkins, I am working on privacy-preserving chest X-ray diagnosis with Federated Learning and would value your guidance on DP budget allocation.',
          'Excited to mentor this project! The research direction is timely and methodologically sound. Looking forward to reviewing your experimental setup.'
        ]
      );

      // 6. Insert Mentor Review
      await conn.query(
        `INSERT INTO mentor_reviews 
         (project_id, mentor_id, review_decision, general_feedback, strengths, weaknesses, recommended_actions)
         VALUES (?, ?, 'approved', ?, ?, ?, ?)`,
        [
          projectId,
          primaryMentorId,
          'The research proposal demonstrates high rigor, clear clinical motivation, and strong alignment with state-of-the-art decentralized learning literature.',
          'Well-defined problem statement, excellent selection of benchmark literature (FedAvg + CheXNet), and measurable success criteria.',
          'Ensure that gradient inversion attacks (such as DLG/iDLG) are accounted for in the threat model.',
          'Proceed to Hypothesis Lab: run 50 federated rounds across 5 simulated hospital nodes and graph the AUC convergence curves.'
        ]
      );

      // 7. Insert Hypotheses & Experiments
      const [hypoRes] = await conn.query(
        `INSERT INTO hypotheses (project_id, statement, rationale, status)
         VALUES (?, ?, ?, 'testing')`,
        [
          projectId,
          'Adaptive DP-SGD with dynamic gradient clipping achieves within 3.5% AUC of centralized pooling while strictly maintaining epsilon <= 3.8 across 5 non-IID nodes.',
          'Dynamic clipping prevents aggressive outlier gradient truncation in heterogeneous medical image distributions, preserving minority pathology feature learning.',
          'testing'
        ]
      );
      const hypothesisId = hypoRes.insertId;

      // Experiment 1
      await conn.query(
        `INSERT INTO experiments 
         (hypothesis_id, project_id, title, procedure_steps, evaluation_metric, success_criteria, observations, quantitative_data, result_outcome, conclusion, mentor_reviewed, mentor_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'supported', ?, TRUE, ?)`,
        [
          hypothesisId,
          projectId,
          'Baseline FedAvg vs Centralized DenseNet-121 Benchmark',
          '1. Partition NIH ChestX-ray14 into 5 client subsets with Dirichlet distribution (alpha = 0.5).\n2. Train centralized DenseNet-121 for 40 epochs as gold-standard upper bound.\n3. Execute 50 FedAvg communication rounds with 3 local epochs per round.\n4. Evaluate macro AUC across 14 pathologies on held-out global test set.',
          'Macro Area Under ROC Curve (AUC)',
          'Federated model AUC >= 0.840 (within 4% of Centralized 0.875)',
          'Centralized training achieved 0.878 AUC. FedAvg reached 0.852 AUC after round 38 with stable convergence.',
          JSON.stringify([
            { round: 5, centralized_auc: 0.720, federated_auc: 0.680 },
            { round: 10, centralized_auc: 0.785, federated_auc: 0.742 },
            { round: 20, centralized_auc: 0.834, federated_auc: 0.801 },
            { round: 30, centralized_auc: 0.862, federated_auc: 0.835 },
            { round: 40, centralized_auc: 0.875, federated_auc: 0.849 },
            { round: 50, centralized_auc: 0.878, federated_auc: 0.852 }
          ]),
          'The federated model successfully converged to 0.852 AUC without any raw data pooling, meeting the 4% gap criterion.',
          'Excellent preliminary convergence. Next experiment should test privacy noise addition.'
        ]
      );

      // Experiment 2
      await conn.query(
        `INSERT INTO experiments 
         (hypothesis_id, project_id, title, procedure_steps, evaluation_metric, success_criteria, observations, quantitative_data, result_outcome, conclusion, mentor_reviewed, mentor_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'supported', ?, TRUE, ?)`,
        [
          hypothesisId,
          projectId,
          'Privacy Budget (Epsilon) vs Pathology Diagnostic Accuracy',
          '1. Inject Gaussian DP noise into aggregated client gradients at sigma values [0.8, 1.2, 1.5, 2.0].\n2. Compute cumulative epsilon expenditure via Renyi Differential Privacy accountant.\n3. Measure resulting AUC drop and training stability.',
          'AUC vs Epsilon expenditure (epsilon <= 4.0)',
          'Retain AUC >= 0.835 under privacy budget epsilon <= 3.8',
          'At sigma = 1.2, total privacy expenditure reached epsilon = 3.65 with final AUC of 0.841.',
          JSON.stringify([
            { epsilon: 1.5, auc: 0.782, label: 'High Privacy (eps=1.5)' },
            { epsilon: 2.4, auc: 0.814, label: 'Medium-High (eps=2.4)' },
            { epsilon: 3.2, auc: 0.833, label: 'Target Balance (eps=3.2)' },
            { epsilon: 3.65, auc: 0.841, label: 'Optimal Budget (eps=3.65)' },
            { epsilon: 5.0, auc: 0.849, label: 'Low Privacy (eps=5.0)' }
          ]),
          'The hypothesis is supported: adaptive clipping with DP-SGD preserves clinical utility (0.841 AUC) while guaranteeing mathematical privacy under epsilon = 3.65.',
          'Rigorous results. You are ready to generate the final research validation report.'
        ]
      );

      // 8. Insert Project Versions
      await conn.query(
        `INSERT INTO project_versions 
         (project_id, version_number, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, change_summary)
         VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          'Federated Learning for Medical Imaging',
          'Healthcare AI',
          'Hospitals cannot share patient X-rays.',
          'Centralized AI violates HIPAA privacy laws.',
          'Use basic federated learning to train models without sharing images.',
          'Train a model on 3 hospital clients.',
          'PyTorch, Python',
          'Initial proposal draft submission.'
        ]
      );

      await conn.query(
        `INSERT INTO project_versions 
         (project_id, version_number, title, domain, problem_statement, limitations, proposed_solution, objectives, technologies, change_summary)
         VALUES (?, 2, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          'Federated Learning for Privacy-Preserving Chest X-Ray Anomaly Detection',
          'Healthcare AI & Federated Learning',
          'Hospitals cannot share raw patient chest X-ray scans due to strict HIPAA and GDPR regulations, resulting in medical AI models trained on small, localized datasets that fail to generalize across diverse clinical populations.',
          'Existing central aggregation models leak gradient inversions, require massive centralized bandwidth, and perform poorly under non-IID demographic label skew.',
          'We propose a personalized Federated Learning framework integrating Differential Privacy and dynamic layer-wise gradient aggregation to train multi-institutional diagnostic models without transferring raw radiological imagery.',
          '1. Implement a decentralized client-server federated loop with PySyft/PyTorch.\n2. Formulate dynamic gradient clipping with epsilon < 4.0 Differential Privacy.\n3. Validate generalization across NIH ChestX-ray14 and CheXpert datasets.\n4. Measure F1-score vs privacy budget trade-off.',
          'PyTorch, Flower/PySyft, TorchVision, Python, FastAPI, Docker, CUDA',
          'Refined methodology with Differential Privacy budget constraints and benchmark datasets based on literature review.'
        ]
      );
    }

    console.log('Seed completed successfully!');
    console.log('Demo Credentials:');
    console.log('  Student: student@hypothesisgate.edu / student123');
    console.log('  Mentor:  mentor@hypothesisgate.edu  / mentor123');
    console.log('  Mentor 2: aravind@hypothesisgate.edu / mentor123');
  } catch (err) {
    console.error('Error during seeding:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;
