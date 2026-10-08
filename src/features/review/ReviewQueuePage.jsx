import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, HelpCircle, ListChecks, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Field';
import { EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useAnswerReviewQuestionMutation, useGetReviewQueueQuery } from './reviewQueueApi';

export default function ReviewQueuePage() {
  const navigate = useNavigate();
  const { data: items = [], isLoading, isFetching, refetch } = useGetReviewQueueQuery();
  const [answerQuestion] = useAnswerReviewQuestionMutation();

  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const handleAnswerChange = (itemId, val) => {
    setAnswers((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = async (item) => {
    const text = (answers[item.id] ?? item.answer_text ?? '').trim();
    if (!text) {
      toast.error('Please enter or select an answer.');
      return;
    }

    setSubmittingId(item.id);
    const toastId = toast.loading('Submitting answer and resuming application…');
    try {
      await answerQuestion({
        questionId: item.id,
        answerText: text,
      }).unwrap();

      toast.dismiss(toastId);
      toast.success('Answer recorded! Application updated and resuming.');
      refetch();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(errorMessage(err) || 'Failed to submit answer.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Review Queue"
        description="Whenever the Dice application wizard encounters an unmapped screener question, it pauses safely here for your input."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh Queue
            </Button>
            <Button variant="ghost" onClick={() => navigate('/applications')}>
              View Applications
            </Button>
          </div>
        }
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center border-signal/20 bg-paper-sunken/40">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-signal-soft text-signal mb-4">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="font-serif text-2xl font-medium text-ink">Review Queue is Clear</h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-ink-soft leading-relaxed">
            No applications are currently paused waiting for human answers. All Dice applications are moving automatically.
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate('/applications')}>
              View Application Tracker
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge tone="amber" dot className="font-semibold text-xs">
              {items.length} Pending Review
            </Badge>
            <span className="text-xs text-ink-soft">
              Employer screener questions waiting for your response
            </span>
          </div>

          {items.map((item) => {
            const currentAnswer = answers[item.id] ?? item.answer_text ?? '';
            const isBusy = submittingId === item.id;
            const hasOptions = Array.isArray(item.options) && item.options.length > 0;

            return (
              <Card key={item.id} className="border-l-4 border-l-amber p-5 shadow-card">
                <CardBody className="p-0 space-y-4">
                  {/* Top Bar: Company & Role */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <Badge tone="amber">Application Paused</Badge>
                      <span className="font-semibold text-sm text-ink">{item.company || 'Company'}</span>
                      <span className="text-xs text-ink-soft">· {item.job_title || 'Position'}</span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <HelpCircle className="size-5 text-amber shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-semibold text-ink leading-snug">
                        {item.question_text}
                      </p>
                      {item.field_name && (
                        <p className="text-xs text-ink-soft mt-0.5">Field: {item.field_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Answer Input / Multiple Choice Radio Group */}
                  <div className="pl-8 pt-1">
                    {hasOptions ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                          Select an option:
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {item.options.map((opt, idx) => (
                            <label
                              key={idx}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-control border p-3 text-sm transition ${
                                currentAnswer === opt
                                  ? 'border-signal bg-signal-soft/60 font-semibold text-signal-deep'
                                  : 'border-line hover:bg-paper-sunken text-ink'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question_${item.id}`}
                                value={opt}
                                checked={currentAnswer === opt}
                                onChange={() => handleAnswerChange(item.id, opt)}
                                className="accent-[var(--color-signal)]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Input
                          placeholder="Type your answer here…"
                          value={currentAnswer}
                          onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-3 border-t border-line">
                    <Button
                      icon={Send}
                      loading={isBusy}
                      disabled={!currentAnswer.trim()}
                      onClick={() => handleSubmit(item)}
                    >
                      Submit Answer & Resume Application
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
