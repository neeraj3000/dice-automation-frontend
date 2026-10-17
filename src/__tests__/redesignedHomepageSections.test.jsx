import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Features from '../features/home/Features';
import HowItWorks from '../features/home/HowItWorks';
import TrustSection from '../features/home/TrustSection';

// Mock IntersectionObserver for Framer Motion in JSDOM
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

describe('Redesigned Homepage Sections Suite', () => {
  describe('Section A: Features (Core Capabilities - Editorial Showcase)', () => {
    it('renders editorial showcase with asymmetric centerpiece and supporting panels', () => {
      render(<Features />);

      // Section Eyebrow & Headline
      expect(screen.getByText(/02 · CORE CAPABILITIES/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Engineered for Scanner Precision/i })).toBeInTheDocument();

      // Featured Centerpiece
      expect(screen.getByText(/Featured Centerpiece/i)).toBeInTheDocument();
      expect(screen.getByText(/One Library\. Algorithmic Resume-to-Job Matching\./i)).toBeInTheDocument();
      expect(screen.getByText(/Lead Cloud & Distributed Systems Architect/i)).toBeInTheDocument();
      expect(screen.getByText(/Dice Verified Opening/i)).toBeInTheDocument();

      // Extracted Requirements Chips
      expect(screen.getByText(/AWS ECS \/ EKS/i)).toBeInTheDocument();
      expect(screen.getByText(/Distributed Go/i)).toBeInTheDocument();

      // Interactive Resume Comparison Selector
      const primaryResume = screen.getByText('Cloud_Architect_Lead_2026.pdf');
      const altResume = screen.getByText('FullStack_Platform_Staff.pdf');
      expect(primaryResume).toBeInTheDocument();
      expect(altResume).toBeInTheDocument();
      expect(screen.getByText('96% Fit')).toBeInTheDocument();

      // Supporting Capabilities
      expect(screen.getByText(/Target Search Profiles Without Duplicate Fatigue/i)).toBeInTheDocument();
      expect(screen.getByText(/Human-in-the-Loop for Ambiguous Screeners/i)).toBeInTheDocument();
    });

    it('allows toggling between resume options in the featured centerpiece preview', () => {
      render(<Features />);

      const altResume = screen.getByText('FullStack_Platform_Staff.pdf');
      fireEvent.click(altResume);

      // Verify click interaction works smoothly without errors
      expect(screen.getByText('Skill Gap: Go')).toBeInTheDocument();
    });
  });

  describe('Section B: HowItWorks (Application Pipeline - Connected Workflow)', () => {
    it('renders directional 4-stage pipeline with specialized stage previews', () => {
      render(<HowItWorks />);

      // Section Eyebrow & Headline
      expect(screen.getByText(/03 · APPLICATION PIPELINE/i)).toBeInTheDocument();
      expect(screen.getByText(/How Apply2Hire works from/i)).toBeInTheDocument();

      // 4 Stages
      expect(screen.getAllByText(/Resume Library Ingestion/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Search Profile Configuration/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Semantic Gap Matrix & Pairing/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Supervised Dispatch & Tracking/i).length).toBeGreaterThanOrEqual(1);

      // Stage Numbers
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('03')).toBeInTheDocument();
      expect(screen.getByText('04')).toBeInTheDocument();

      // Active Default Preview (Stage 03)
      expect(screen.getByText(/Vector Compatibility Score/i)).toBeInTheDocument();
      expect(screen.getByText(/96% Keyword Fit/i)).toBeInTheDocument();
    });

    it('allows interactive inspection across stages via the workflow timeline tabs', () => {
      render(<HowItWorks />);

      const step01Btn = screen.getByRole('button', { name: /01 Ingest/i });
      fireEvent.click(step01Btn);

      expect(screen.getByText(/Phase 01 of 04 · Preparation/i)).toBeInTheDocument();
      expect(screen.getByText(/Extracted Profile Vectors/i)).toBeInTheDocument();

      const step04Btn = screen.getByRole('button', { name: /04 Dispatch/i });
      fireEvent.click(step04Btn);

      expect(screen.getByText(/Phase 04 of 04 · Execution/i)).toBeInTheDocument();
      expect(screen.getByText(/Dispatch Execution State/i)).toBeInTheDocument();
    });
  });

  describe('Section C: TrustSection (Platform Trust & Control - Architecture Canvas)', () => {
    it('renders dark trust architecture canvas with 4 security gates and 3 control pillars', () => {
      render(<TrustSection />);

      // Section Eyebrow & Headline
      expect(screen.getByText(/04 · PLATFORM TRUST & CONTROL/i)).toBeInTheDocument();
      expect(screen.getByText(/Architected for total user control/i)).toBeInTheDocument();

      // 4 Security Gates (using getAllByText because gate cards and inspector share labels)
      expect(screen.getAllByText(/GATE 01/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Authenticated Tenant Boundary/i).length).toBeGreaterThanOrEqual(1);

      expect(screen.getAllByText(/GATE 02/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Local Session & Token Isolation/i).length).toBeGreaterThanOrEqual(1);

      expect(screen.getAllByText(/GATE 03/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Review Queue & Atomic Stop Control/i).length).toBeGreaterThanOrEqual(1);

      expect(screen.getAllByText(/GATE 04/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Deduplication Shield & Audit Trail/i).length).toBeGreaterThanOrEqual(1);

      // 3 Structured Trust Pillars
      expect(screen.getByText(/Absolute User Control/i)).toBeInTheDocument();
      expect(screen.getByText(/Cryptographic Data Scoping/i)).toBeInTheDocument();
      expect(screen.getByText(/Operational Accountability/i)).toBeInTheDocument();

      // Verified Claims
      expect(screen.getByText(/1-Click Atomic Stop:/i)).toBeInTheDocument();
      expect(screen.getByText(/Multi-Tenant Database:/i)).toBeInTheDocument();
      expect(screen.getByText(/Duplicate Shield:/i)).toBeInTheDocument();
    });

    it('updates active inspector details when switching between security gates', () => {
      render(<TrustSection />);

      // Initially Gate 03 is selected
      expect(screen.getByText(/Active Architecture Inspector · Gate 03/i)).toBeInTheDocument();

      // Click Gate 01 button
      const gate01Btn = screen.getByRole('button', { name: /GATE 01 Authenticated Tenant Boundary/i });
      fireEvent.click(gate01Btn);

      expect(screen.getByText(/Active Architecture Inspector · Gate 01/i)).toBeInTheDocument();
      expect(screen.getByText(/JWT tokens cryptographically sign user identity/i)).toBeInTheDocument();

      // Click Gate 04 button
      const gate04Btn = screen.getByRole('button', { name: /GATE 04 Deduplication Shield & Audit Trail/i });
      fireEvent.click(gate04Btn);

      expect(screen.getByText(/Active Architecture Inspector · Gate 04/i)).toBeInTheDocument();
      expect(screen.getByText(/Applications are indexed by \(user_id, job_id\)/i)).toBeInTheDocument();
    });
  });
});
