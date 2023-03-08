import React from "react";
import { useState } from "react";
import { Card, Badge, Col, Stack, Button, Row } from "react-bootstrap";

export const Campaigns = (props) => {
  const [ammount, setAmmount] = useState("");
  return (
    <Row xs={1} md={3} className="g-4">
      {props.campaigns.map((campaign) => (
        <Col key={campaign.index}>
          <Card className="h-100">
            <Card.Header>
              <Stack direction="horizontal" gap={2}>
                <Badge bg="secondary" className="ms-auto">
                  {campaign.index} ID
                </Badge>

                <Badge bg="secondary" className="ms-auto">
                  goal: {campaign.goal}cUSD
                </Badge>

                <Badge bg="secondary" className="ms-auto">
                  {campaign.totalRaised} cUSD Raised
                </Badge>
              </Stack>
            </Card.Header>

            <div className=" ratio ratio-4x3">
              <img
                src={campaign.image}
                alt={campaign.description}
                style={{ objectFit: "cover" }}
              />
            </div>

            <Card.Body className="d-flex  flex-column text-center">
              <Card.Text className="flex-grow-1">
                {campaign.description}
              </Card.Text>

              <form>
                <div class="form-r">
                  <input
                    type="number"
                    class="form-control mt-3"
                    value={ammount}
                    onChange={(e) => setAmmount(e.target.value)}
                    placeholder="enter ammount"
                  />
                  <button
                    type="button"
                    onClick={() => props.fundCampaign(campaign.index, ammount)}
                    class="btn btn-dark mt-1"
                  >
                    fund this campaign
                  </button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
